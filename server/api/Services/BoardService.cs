using System.Globalization;
using api.dtos.Requests;
using api.dtos.Responses;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

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
    // Create bets (boards)
    // ---------------------------------------------------------
    public async Task<List<BoardDtoResponse>> CreateBetsAsync(
        string userId,
        IEnumerable<CreateBoardRequest> dtos)
    {
        var list = dtos.ToList();
        if (list.Count == 0)
            return new List<BoardDtoResponse>();

        var now = DateTime.UtcNow;

        // Determine ISO week / year
        var currentWeek = ISOWeek.GetWeekOfYear(now);
        var currentYear = now.Year;

        // ---------------------------------------------------------
        // NEW RULE: A draw MUST exist before buying boards
        // ---------------------------------------------------------
        var game = await _db.Games
            .FirstOrDefaultAsync(g => g.Year == currentYear && g.Weeknumber == currentWeek);

        if (game == null)
        {
            throw new Exception("This week's game has not been created yet. Please wait for the draw to open.");
        }

        if (game.Winningnumbers == null || game.Winningnumbers.Count == 0)
        {
            throw new Exception("You cannot purchase boards until this week's winning numbers are set.");
        }

        var gameId = game.Id;

        // ---------------------------------------------------------
        // Load user
        // ---------------------------------------------------------
        var player = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (player == null)
            throw new Exception("User not found");

        var boardsToAdd = new List<Board>();
        int totalCost = 0;

        // ---------------------------------------------------------
        // Build boards & compute total cost
        // ---------------------------------------------------------
        foreach (var dto in list)
        {
            var fields = dto.Numbers.Count;

            var basePrice = await _db.Boardprices
                .Where(x => x.Fieldscount == fields)
                .Select(x => (int?)x.Price)
                .SingleOrDefaultAsync();

            if (basePrice == null)
                throw new Exception($"No price found for {fields} fields.");

            var boardPrice = basePrice.Value * dto.Times;

            // Validate balance incrementally
            if (player.Balance < totalCost + boardPrice)
                throw new Exception("Insufficient balance.");

            totalCost += boardPrice;

            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = userId,
                Gameid = gameId,
                Numbers = dto.Numbers,
                Times = dto.Times,
                Price = boardPrice,
                Createdat = now,
                Iswinner = game.Winningnumbers.All(n => dto.Numbers.Contains(n))
            };

            boardsToAdd.Add(board);
        }

        // ---------------------------------------------------------
        // Deduct balance
        // ---------------------------------------------------------
        player.Balance -= totalCost;

        // ---------------------------------------------------------
        // Create transactions
        // ---------------------------------------------------------
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

        // Save all
        await _db.Boards.AddRangeAsync(boardsToAdd);
        await _db.SaveChangesAsync();

        return boardsToAdd.Select(b => new BoardDtoResponse(b)).ToList();
    }
}
