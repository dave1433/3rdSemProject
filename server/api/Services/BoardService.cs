using System.Globalization;
using api.dtos.Requests;
using api.dtos.Responses;
using api.Errors;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Services;

public class BoardService : IBoardService
{
    private readonly MyDbContext _db;

    public BoardService(MyDbContext db)
    {
        _db = db;
    }

    // ---------------------------------------------------------
    // Get boards for user
    // ---------------------------------------------------------
    public async Task<List<BoardDtoResponse>> GetByUserAsync(string userId)
    {
        var boards = await _db.Boards
            .Include(b => b.Transactions)
            .Where(b => b.Playerid == userId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards.Select(b => new BoardDtoResponse(b)).ToList();
    }

    // ---------------------------------------------------------
    // Admin: get all boards with player + game data
    // ---------------------------------------------------------
    public async Task<List<AdminBoardDtoResponse>> GetAllBoardsForAdminAsync()
    {
        var boards = await _db.Boards
            .Include(b => b.Player)
            .Include(b => b.Game)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards
            .Where(b => b.Player != null && b.Game != null)
            .Select(b => new AdminBoardDtoResponse(b, b.Player!))
            .ToList();
    }

    // ---------------------------------------------------------
    // Get weekly summary of winners
    // ---------------------------------------------------------
    public async Task<List<WeeklyBoardSummaryDto>> GetWeeklyWinningSummaryAsync()
    {
        return await _db.Boards
            .Where(b => b.Iswinner == true && b.Game != null)
            .GroupBy(b => new
            {
                b.Game!.Weeknumber,
                b.Game.Year
            })
            .Select(g => new WeeklyBoardSummaryDto
            {
                Week = g.Key.Weeknumber,
                Year = g.Key.Year,
                TotalWinningBoards = g.Count()
            })
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Week)
            .ToListAsync();
    }

    // ---------------------------------------------------------
    // Create purchase (boards)
    // ---------------------------------------------------------
    public async Task<List<BoardDtoResponse>> CreatePurchaseAsync(
        string userId,
        IEnumerable<CreateBoardRequest> dtos)
    {
        var list = dtos.ToList();
        if (list.Count == 0)
            return new List<BoardDtoResponse>();

        var now = DateTime.UtcNow;

        var currentWeek = ISOWeek.GetWeekOfYear(now);
        var currentYear = now.Year;

        var game = await _db.Games
            .FirstOrDefaultAsync(g => g.Year == currentYear && g.Weeknumber == currentWeek);

        if (game == null)
            throw ApiErrors.Conflict(
                "This week's game has not been created yet. Please wait for the draw to open.");

        if (game.Winningnumbers == null || game.Winningnumbers.Count == 0)
            throw ApiErrors.Conflict(
                "You cannot purchase boards until this week's winning numbers are set.");

        if (game.Joindeadline != null && DateTime.UtcNow > game.Joindeadline.Value)
            throw ApiErrors.Conflict(
                "Board purchases are closed because the deadline has passed.");

        var player = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (player == null)
            throw ApiErrors.NotFound("User not found.");

        var boardsToAdd = new List<Board>();
        int totalCost = 0;

        foreach (var dto in list)
        {
            var fields = dto.Numbers.Count;

            var basePrice = await _db.Boardprices
                .Where(x => x.Fieldscount == fields)
                .Select(x => (int?)x.Price)
                .SingleOrDefaultAsync();

            if (basePrice == null)
                throw ApiErrors.NotFound(
                    $"No price is configured for a board with {fields} fields.");

            var boardPrice = basePrice.Value * dto.Times;

            if (player.Balance < totalCost + boardPrice)
                throw ApiErrors.Conflict(
                    "You do not have enough balance to complete this purchase.");

            totalCost += boardPrice;

            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = userId,
                Gameid = game.Id,
                Numbers = dto.Numbers,
                Times = dto.Times,
                Price = boardPrice,
                Createdat = now,
                Iswinner = game.Winningnumbers.All(n => dto.Numbers.Contains(n))
            };

            boardsToAdd.Add(board);
        }

        player.Balance -= totalCost;

        foreach (var board in boardsToAdd)
        {
            _db.Transactions.Add(new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = userId,
                Type = "purchase",
                Amount = -board.Price,
                Status = "approved",
                Boardid = board.Id,
                Createdat = now
            });
        }

        await _db.Boards.AddRangeAsync(boardsToAdd);
        await _db.SaveChangesAsync();

        return boardsToAdd.Select(b => new BoardDtoResponse(b)).ToList();
    }

    // ---------------------------------------------------------
    // Auto-repeat
    // ---------------------------------------------------------
    public async Task<AutoRepeatResponse> SetAutoRepeatAsync(string playerId, string boardId, bool autoRepeat)
    {
        var board = await _db.Boards
            .FirstOrDefaultAsync(b => b.Id == boardId && b.Playerid == playerId);

        if (board == null)
            throw ApiErrors.NotFound(
                "The selected board could not be found for your account.");

        if (autoRepeat)
        {
            if (!string.IsNullOrEmpty(board.Repeatid))
            {
                var existing = await _db.Repeats
                    .FirstOrDefaultAsync(r => r.Id == board.Repeatid && r.Playerid == playerId);

                if (existing != null && existing.Optout)
                    throw ApiErrors.Conflict(
                        "This repeat was stopped and cannot be restarted. Please buy a new board to repeat again.");
            }

            board.AutoRepeat = true;

            if (string.IsNullOrEmpty(board.Repeatid))
            {
                const int defaultWeeks = 10;
                var fields = board.Numbers.Count;

                var unitPrice = await _db.Boardprices
                    .Where(p => p.Fieldscount == fields)
                    .Select(p => (int?)p.Price)
                    .SingleOrDefaultAsync();

                if (unitPrice == null)
                    throw ApiErrors.NotFound(
                        $"No price is configured for a board with {fields} fields.");

                var times = board.Times <= 0 ? 1 : board.Times;
                var total = unitPrice.Value * times;

                var repeat = new Repeat
                {
                    Id = Guid.NewGuid().ToString(),
                    Playerid = playerId,
                    Numbers = board.Numbers,
                    Times = times,
                    Price = total,
                    Remainingweeks = defaultWeeks,
                    Optout = false,
                    Createdat = DateTime.UtcNow
                };

                _db.Repeats.Add(repeat);
                board.Repeatid = repeat.Id;
            }
        }
        else
        {
            board.AutoRepeat = false;

            if (!string.IsNullOrEmpty(board.Repeatid))
            {
                var repeat = await _db.Repeats
                    .FirstOrDefaultAsync(r => r.Id == board.Repeatid && r.Playerid == playerId);

                if (repeat != null)
                {
                    repeat.Optout = true;
                    repeat.Optoutat = DateTime.UtcNow;
                    repeat.Remainingweeks = 0;
                }
            }
        }

        await _db.SaveChangesAsync();

        var stopped = false;
        if (!string.IsNullOrEmpty(board.Repeatid))
        {
            var rep = await _db.Repeats.FirstOrDefaultAsync(r => r.Id == board.Repeatid);
            stopped = rep?.Optout ?? false;
        }

        return new AutoRepeatResponse
        {
            BoardId = board.Id,
            AutoRepeat = board.AutoRepeat,
            RepeatId = board.Repeatid,
            IsStopped = stopped
        };
    }

    // ---------------------------------------------------------
    // Repeat processing
    // ---------------------------------------------------------
    public async Task ProcessRepeatOrdersForGameAsync(string gameId)
    {
        var game = await _db.Games.FirstOrDefaultAsync(g => g.Id == gameId);
        if (game == null)
            throw ApiErrors.NotFound("Game not found.");

        if (game.Winningnumbers == null || game.Winningnumbers.Count == 0)
            return;

        var repeats = await _db.Repeats
            .Where(r => r.Optout == false && r.Remainingweeks > 0)
            .ToListAsync();

        foreach (var r in repeats)
            await ProcessSingleRepeatForGameAsync(r.Id, gameId);
    }

    private async Task ProcessSingleRepeatForGameAsync(string repeatId, string gameId)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        try
        {
            var repeat = await _db.Repeats.FirstAsync(r => r.Id == repeatId);

            if (repeat.Optout || repeat.Remainingweeks <= 0)
            {
                await tx.RollbackAsync();
                return;
            }

            var fields = repeat.Numbers.Count;

            var unitPrice = await _db.Boardprices
                .Where(p => p.Fieldscount == fields)
                .Select(p => (int?)p.Price)
                .SingleOrDefaultAsync();

            if (unitPrice == null)
                throw ApiErrors.NotFound(
                    $"No price is configured for a board with {fields} fields.");

            var times = repeat.Times <= 0 ? 1 : repeat.Times;
            var total = unitPrice.Value * times;
            var now = DateTime.UtcNow;

            var player = await _db.Users
                .FromSqlInterpolated($@"select * from deadpigeons.""user"" where id = {repeat.Playerid} for update")
                .SingleAsync();

            if (player.Balance < total)
            {
                _db.Transactions.Add(new Transaction
                {
                    Id = Guid.NewGuid().ToString(),
                    Playerid = repeat.Playerid,
                    Type = "purchase",
                    Amount = -total,
                    Status = "rejected",
                    Createdat = now
                });

                repeat.Optout = true;
                repeat.Optoutat = now;
                repeat.Remainingweeks = 0;

                await _db.SaveChangesAsync();
                await tx.CommitAsync();
                return;
            }

            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Gameid = gameId,
                Numbers = repeat.Numbers,
                Times = times,
                Price = total,
                Repeatid = repeat.Id,
                AutoRepeat = false,
                Createdat = now,
                Iswinner = false
            };

            _db.Boards.Add(board);
            await _db.SaveChangesAsync();

            player.Balance -= total;

            _db.Transactions.Add(new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Type = "purchase",
                Amount = -total,
                Status = "approved",
                Boardid = board.Id,
                Createdat = now
            });

            repeat.Remainingweeks -= 1;
            if (repeat.Remainingweeks <= 0)
            {
                repeat.Optout = true;
                repeat.Optoutat = now;
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            await tx.RollbackAsync();
        }
    }

    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        var pg = ex.InnerException as PostgresException;
        return pg?.SqlState == PostgresErrorCodes.UniqueViolation;
    }

    // ---------------------------------------------------------
    // Board locked status
    // ---------------------------------------------------------
    public async Task<IsBoardLockedResponse> GetIsBoardLockedAsync()
    {
        var now = DateTime.UtcNow;
        var week = ISOWeek.GetWeekOfYear(now);
        var year = now.Year;

        var game = await _db.Games
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Year == year && g.Weeknumber == week);

        if (game == null)
        {
            return new IsBoardLockedResponse
            {
                IsOpen = false,
                Message = "This week's game has not been created yet. Please wait for the draw to open.",
                Year = year,
                WeekNumber = week
            };
        }

        if (game.Winningnumbers == null || game.Winningnumbers.Count == 0)
        {
            return new IsBoardLockedResponse
            {
                IsOpen = false,
                Message = "You cannot purchase boards until this week's winning numbers are set.",
                Year = year,
                WeekNumber = week
            };
        }

        return new IsBoardLockedResponse
        {
            IsOpen = true,
            Message = null,
            Year = year,
            WeekNumber = week
        };
    }
}
