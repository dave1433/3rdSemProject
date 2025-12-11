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

    public async Task<List<BoardDtoResponse>> GetByUserAsync(string userId)
    {
        var boards = await _db.Boards
            .Include(b => b.Transactions)
            .Where(b => b.Playerid == userId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards.Select(b => new BoardDtoResponse(b)).ToList();
    }

    public async Task<List<BoardDtoResponse>> CreateBetsAsync(
        string userId,
        IEnumerable<CreateBoardRequest> dtos)
    {
        var list = dtos.ToList();
        if (list.Count == 0)
            return new List<BoardDtoResponse>();

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

        var boardsToAdd = new List<Board>();
        var totalCost = 0;

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

            var futureTotal = boardPrice + totalCost;
            if (player.Balance - futureTotal < 0)
            {
                throw new Exception(
                    $"Insufficient balance for this bet. " +
                    $"Need {futureTotal} DKK, have {player.Balance} DKK.");
            }

            totalCost = futureTotal;

            var board = new Board
            {
                Id        = Guid.NewGuid().ToString(),
                Playerid  = userId,
                Gameid    = gameId,
                Numbers   = dto.Numbers,
                Times     = dto.Times,
                Price     = boardPrice,
                Createdat = nowUtc
            };

            boardsToAdd.Add(board);
        }

        // validate balance once more
        if (player.Balance < totalCost)
            throw new Exception(
                $"Insufficient balance: need {totalCost}, have {player.Balance}");

        // deduct balance
        player.Balance -= totalCost;

        // add purchase transactions
        foreach (var board in boardsToAdd)
        {
            _db.Transactions.Add(new Transaction
            {
                Id        = Guid.NewGuid().ToString(),
                Playerid  = userId,
                Type      = "purchase",
                Amount    = -board.Price,
                Status    = "approved",
                Boardid   = board.Id,
                Createdat = nowUtc
            });
        }

        await _db.Boards.AddRangeAsync(boardsToAdd);
        await _db.SaveChangesAsync();

        return boardsToAdd.Select(b => new BoardDtoResponse(b)).ToList();
    }

    

}
