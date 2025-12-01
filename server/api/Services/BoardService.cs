using System.Globalization;
using api.dtos.Responses;
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

    // ========== GET BY PLAYER ==============
    public async Task<List<BoardDtos.BoardDto>> GetByPlayerAsync(string playerId)
    {
        var entities = await _db.Boards
            .Where(b => b.Playerid == playerId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return entities
            .Select(b => new BoardDtos.BoardDto(b))
            .ToList();
    }

    // ========= CREATE BETS (PURCHASE) ======
    public async Task<List<BoardDtos.BoardDto>> CreateBetsAsync(
        IEnumerable<CreateBoardRequestDto> dtos)
    {
        var boardsToAdd = new List<Board>();

        foreach (var dto in dtos)
        {
            if (dto.PlayerId is null)
                throw new ArgumentException("PlayerId is required.", nameof(dto.PlayerId));

            if (dto.Numbers is null || dto.Numbers.Length is < 5 or > 8)
                throw new ArgumentException("Numbers must be between 5 and 8.", nameof(dto.Numbers));

            var board = new Board
            {
                Id        = Guid.NewGuid().ToString(),
                Playerid  = dto.PlayerId,
                Gameid    = null, // or set current game if you have that logic
                Numbers   = dto.Numbers.ToList(),
                Price     = dto.Numbers.Length * dto.Times * 20, // your price rule
                Createdat = DateTime.UtcNow
            };

            boardsToAdd.Add(board);
        }

        _db.Boards.AddRange(boardsToAdd);
        await _db.SaveChangesAsync();

        return boardsToAdd
            .Select(b => new BoardDtos.BoardDto(b))
            .ToList();
    }
}