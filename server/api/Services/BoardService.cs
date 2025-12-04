using api.DTOs.Requests;
using api.DTOs.Responses;
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

    public async Task<List<BoardDtoResponse>> GetByPlayerAsync(string playerId)
    {
        var boards = await _db.Boards
            .Include(b => b.Transactions)
            .Where(b => b.Playerid == playerId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards.Select(b => new BoardDtoResponse(b)).ToList();
    }

    public async Task<List<BoardDtoResponse>> CreateBetsAsync(IEnumerable<CreateBoardRequest> dtos)
    {
        var list = dtos.ToList();
        if (list.Count == 0)
            return new List<BoardDtoResponse>();

        var currentGameId = await GetCurrentGameIdAsync();
        var now = DateTime.UtcNow;
        var boardsToAdd = new List<Board>();

        foreach (var dto in list)
        {
            if (dto.Numbers == null)
                throw new ArgumentException("Numbers are required.", nameof(dto.Numbers));

            var fields = dto.Numbers.Count;
            if (fields < 5 || fields > 8)
                throw new ArgumentException("Numbers must be between 5 and 8.", nameof(dto.Numbers));

            // Look up base price from boardprice table
            var basePrice = await _db.Boardprices
                .Where(p => p.Fieldscount == fields)
                .Select(p => (int?)p.Price)
                .SingleOrDefaultAsync();

            if (basePrice == null)
                throw new InvalidOperationException($"No board price configured for {fields} fields.");

            var totalPrice = basePrice.Value * dto.Times;

            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = dto.PlayerId,
                Gameid = currentGameId,
                Numbers = dto.Numbers,
                Price = totalPrice,
                Times = dto.Times,
                Createdat = now
            };

            boardsToAdd.Add(board);
        }

        await _db.Boards.AddRangeAsync(boardsToAdd);

        // TODO: if you also adjust player balance / create Transaction rows,
        // keep that logic here, just remember to set board.Times & board.Price as above.

        await _db.SaveChangesAsync();

        return boardsToAdd.Select(b => new BoardDtoResponse(b)).ToList();
    }

    private async Task<string?> GetCurrentGameIdAsync()
    {
        var game = await _db.Games
            .OrderByDescending(g => g.Createdat)
            .FirstOrDefaultAsync();

        return game?.Id;
    }
}
