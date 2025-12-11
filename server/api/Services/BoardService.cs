using System.Globalization;
using api.dtos.Requests;
using api.dtos.Responses;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace api.Services;

public class BoardService : IBoardService
{
    private readonly MyDbContext _db;

    public BoardService(MyDbContext db)
    {
        _db = db;
    }

    public async Task<List<BoardDtoResponse>> GetByUserAsync(string userId)
    {
        var boards = await _db.Boards
            .Include(b => b.Transactions)
            .Where(b => b.Playerid == userId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards.Select(b => new BoardDtoResponse(b)).ToList();
    }
    
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

        // current time in UTC
        var nowUtc = DateTime.UtcNow;

        // ----------------------------------------------------
        // Find the latest *open* game: below are the conditions
        //  - has winning numbers &&
        //  - has join deadline
        // ----------------------------------------------------
        var currentGameQuery = _db.Games
            .Where(g =>
                g.Winningnumbers != null &&
                g.Winningnumbers.Count > 0 &&
                g.Joindeadline.HasValue &&           
                g.Joindeadline.Value > nowUtc);

        var currentGame = await currentGameQuery
            .OrderByDescending(g => g.Year)
            .ThenByDescending(g => g.Weeknumber)
            .FirstOrDefaultAsync();

        if (currentGame == null)
        {
            // no open game that matches the rule above
            throw new Exception("This week’s game is closed for new boards.");
        }

        var gameId = currentGame.Id;

        // ----------------------------------------------------
        // Normal purchase logic (unchanged except for nowUtc)
        // ----------------------------------------------------

        var player = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (player == null)
            throw new Exception("User not found");

   public async Task<List<BoardDtoResponse>> CreateBetsAsync(
    string userId,
    IEnumerable<CreateBoardRequest> dtos)
    {
    var list = dtos.ToList();
    if (list.Count == 0)
        return new List<BoardDtoResponse>();

    var now = DateTime.UtcNow;

    // ------------------------------------------------------------
    // 1️⃣ Determine current ISO week + year
    // ------------------------------------------------------------
    var currentWeek = ISOWeek.GetWeekOfYear(now);
    var currentYear = now.Year;

    // ------------------------------------------------------------
    // 2️⃣ Fetch or create the Game for this week
    // ------------------------------------------------------------
    var game = await _db.Games
        .FirstOrDefaultAsync(g => g.Year == currentYear && g.Weeknumber == currentWeek);

    if (game == null)
    {
        game = new Game
        {
            Id = Guid.NewGuid().ToString(),
            Year = currentYear,
            Weeknumber = currentWeek,
            Winningnumbers = null,
            Createdat = now
        };

        _db.Games.Add(game);
        await _db.SaveChangesAsync();
    }

    var gameId = game.Id;

    // ------------------------------------------------------------
    // 3️⃣ Load the authenticated user
    // ------------------------------------------------------------
    var player = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
    if (player == null)
        throw new Exception("User not found");

            var boardPrice = basePrice.Value * dto.Times;

            var futureTotal = boardPrice + totalCost;
            if (player.Balance - futureTotal < 0)
            {
                throw new Exception(
                    $"Insufficient balance for this bet. " +
                    $"Need {futureTotal} DKK, have {player.Balance} DKK.");
            }

    foreach (var dto in list)
    {
        var fields = dto.Numbers.Count;

        // Fetch correct price based on amount of fields
        var basePrice = await _db.Boardprices
            .Where(x => x.Fieldscount == fields)
            .Select(x => (int?)x.Price)
            .SingleOrDefaultAsync();

        if (basePrice == null)
            throw new Exception($"No price found for {fields} fields.");

        var boardPrice = basePrice.Value * dto.Times;

        var futureTotal = boardPrice + totalCost;
        if (player.Balance - futureTotal < 0)
        {
            throw new Exception(
                $"Insufficient balance for this bet. Need {futureTotal} DKK, have {player.Balance} DKK.");
        }

        totalCost = futureTotal;

        // ------------------------------------------------------------
        // 4️⃣ Create the board
        // ------------------------------------------------------------
        var board = new Board
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = userId,
            Gameid = gameId,
            Numbers = dto.Numbers,
            Times = dto.Times,
            Price = boardPrice,
            Createdat = now
        };

        // ------------------------------------------------------------
        // 5️⃣ Evaluate winner immediately IF game already has winning numbers
        // ------------------------------------------------------------
        if (game.Winningnumbers != null)
        {
            var winningSet = game.Winningnumbers.ToHashSet();
            board.Iswinner = winningSet.All(n => dto.Numbers.Contains(n));
        }
        else
        {
            board.Iswinner = false;
        }

        boardsToAdd.Add(board);
    }

    // ------------------------------------------------------------
    // 6️⃣ Validate balance again before saving
    // ------------------------------------------------------------
    if (player.Balance < totalCost)
        throw new Exception($"Insufficient balance: need {totalCost}, have {player.Balance}");

    // Deduct balance
    player.Balance -= totalCost;

    // ------------------------------------------------------------
    // 7️⃣ Save purchase transactions
    // ------------------------------------------------------------
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

    // Save boards + transactions
    await _db.Boards.AddRangeAsync(boardsToAdd);
    await _db.SaveChangesAsync();

    return boardsToAdd.Select(b => new BoardDtoResponse(b)).ToList();
}
}
   
   

