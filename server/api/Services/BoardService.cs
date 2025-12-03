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

    public async Task<List<BoardDto>> GetByUserAsync(string userId)
    {
        var boards = await _db.Boards
            .Include(b => b.Transactions)
            .Where(b => b.Playerid == userId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards.Select(b => new BoardDto(b)).ToList();
    }

    public async Task<List<BoardDto>> CreateBetsAsync(IEnumerable<CreateBoardRequest> dtos)
    {
        var list = dtos.ToList();
        if (list.Count == 0)
            return new List<BoardDto>();

        var now = DateTime.UtcNow;

        var game = await _db.Games
            .OrderByDescending(g => g.Createdat)
            .FirstOrDefaultAsync();

        var gameId = game?.Id;

        var boardsToAdd = new List<Board>();

        foreach (var dto in list)
        {
            var fields = dto.Numbers.Count;

            var basePrice = await _db.Boardprices
                .Where(x => x.Fieldscount == fields)
                .Select(x => (int?)x.Price)
                .SingleOrDefaultAsync();

            if (basePrice == null)
                throw new Exception($"No price for {fields} fields.");

            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = dto.UserId,
                Gameid = gameId,
                Numbers = dto.Numbers,
                Times = dto.Times,
                Price = basePrice.Value * dto.Times,
                Createdat = now
            };

            boardsToAdd.Add(board);
        }

        await _db.Boards.AddRangeAsync(boardsToAdd);
        await _db.SaveChangesAsync();

        return boardsToAdd.Select(b => new BoardDto(b)).ToList();
    }
}
