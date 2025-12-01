using System.Globalization;
using efscaffold;
using efscaffold.Entities;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BoardService : IBoardService
{
    private readonly MyDbContext _db;

    public BoardService(MyDbContext db)
    {
        _db = db;
    }

    public async Task<List<Board>> GetByPlayerAsync(string playerId)
    {
        // NOTE: adjust property names if scaffolded differently (PlayerId vs Playerid etc.)
        return await _db.Boards
            .Where(b => b.Playerid == playerId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();
    }

    public async Task<List<Board>> CreateBetsAsync(IEnumerable<CreateBoardRequest> dtos)
    {
        var now = DateTime.UtcNow;

        // determine current game (year + ISO week)
        var year = now.Year;
        var week = ISOWeek.GetWeekOfYear(now);

        var game = await _db.Games
            .SingleOrDefaultAsync(g => g.Year == year && g.Weeknumber == week);

        if (game == null)
        {
            game = new Game
            {
                Id = Guid.NewGuid().ToString(),
                Year = year,
                Weeknumber = week,
                Createdat = now
            };

            _db.Games.Add(game);
            await _db.SaveChangesAsync();
        }

        var createdBoards = new List<Board>();
        var playerTotals = new Dictionary<string, int>(); // total spent per player

        foreach (var dto in dtos)
        {
            if (dto.Numbers is null || dto.Numbers.Length < 5 || dto.Numbers.Length > 8)
                throw new ArgumentException("Numbers must be between 5 and 8.", nameof(dto.Numbers));

            if (dto.Times < 1)
                throw new ArgumentException("Times must be >= 1.", nameof(dto.Times));

            var fieldsCount = dto.Numbers.Length;

            var priceRow = await _db.Boardprices
                .SingleOrDefaultAsync(p => p.Fieldscount == fieldsCount);

            if (priceRow == null)
                throw new InvalidOperationException($"No boardprice defined for {fieldsCount} fields.");

            var basePrice = priceRow.Price;          // e.g. 5 → 20, 6 → 40…
            var totalPrice = basePrice * dto.Times;  // total for this bet

            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = dto.PlayerId,
                Gameid = game.Id,
                Numbers = dto.Numbers.ToList(),
                Price = totalPrice,
                Createdat = now
            };

            _db.Boards.Add(board);
            createdBoards.Add(board);

            var tx = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = dto.PlayerId,
                Type = "purchase",
                Amount = -totalPrice,       // money spent
                Status = "approved",        // keep it simple for now
                Boardid = board.Id,
                Createdat = now
            };

            _db.Transactions.Add(tx);

            if (!playerTotals.ContainsKey(dto.PlayerId))
                playerTotals[dto.PlayerId] = 0;

            playerTotals[dto.PlayerId] += totalPrice;
        }

        // update balances on each affected user
        foreach (var kvp in playerTotals)
        {
            var user = await _db.Users.FindAsync(kvp.Key);
            if (user != null)
            {
                user.Balance -= kvp.Value;
            }
        }

        await _db.SaveChangesAsync();
        return createdBoards;
    }
}
