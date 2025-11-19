using System.Globalization;
using api.Dtos.Requests;
using api.Dtos.Responses;
using AutoMapper;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BoardService : IBoardService
{
    private readonly MyDbContext _db;
    private readonly IMapper _mapper;

    public BoardService(MyDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // -----------------------------
    // Admin
    // -----------------------------
    public async Task<IEnumerable<BoardResponse>> GetAllBoards()
    {
        var boards = await _db.Boards.AsNoTracking().ToListAsync();
        return _mapper.Map<IEnumerable<BoardResponse>>(boards);
    }

    public async Task<BoardResponse?> GetBoardById(string id)
    {
        var board = await _db.Boards.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id);

        return board == null ? null : _mapper.Map<BoardResponse>(board);
    }

    public async Task<bool> DeleteBoard(string id)
    {
        var entity = await _db.Boards.FirstOrDefaultAsync(b => b.Id == id);
        if (entity == null) return false;

        _db.Boards.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }

    // -----------------------------
    // Player / Admin
    // -----------------------------
    public async Task<IEnumerable<BoardResponse>> GetBoardsByPlayer(string playerId)
    {
        var boards = await _db.Boards.AsNoTracking()
            .Where(b => b.Playerid == playerId)
            .ToListAsync();

        return _mapper.Map<IEnumerable<BoardResponse>>(boards);
    }

    public async Task<BoardResponse> CreateBoard(CreateBoardDto dto)
    {
        // Validate basic numbers
        ValidateNumbers(dto.Numbers);

        // Load player
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Id == dto.PlayerId);
        if (player == null)
            throw new InvalidOperationException("Player not found.");
        if (!player.Active)
            throw new InvalidOperationException("Player is not active.");

        // Load game
        var game = await _db.Games.FirstOrDefaultAsync(g => g.Id == dto.GameId);
        if (game == null)
            throw new InvalidOperationException("Game not found.");

        // Check join deadline
        if (IsJoinClosed(game))
            throw new InvalidOperationException("Join deadline has passed for this game.");

        // Determine board price from BoardPrice table
        var fieldCount = dto.Numbers.Length;
        var boardPrice = await _db.Boardprices
            .AsNoTracking()
            .FirstOrDefaultAsync(bp => bp.Fieldscount == fieldCount);

        if (boardPrice == null)
            throw new InvalidOperationException($"No board price configured for {fieldCount} fields.");

        var price = boardPrice.Price;

        // Check balance
        if (player.Balance < price)
            throw new InvalidOperationException("Insufficient balance.");

        // Map to entity
        var board = _mapper.Map<Board>(dto);
        board.Id = Guid.NewGuid().ToString();
        board.Price = price;
        board.Createdat = DateTime.UtcNow;

        // Deduct balance (transaction logic can be added later)
        player.Balance -= price;

        _db.Boards.Add(board);
        await _db.SaveChangesAsync();

        return _mapper.Map<BoardResponse>(board);
    }

    public async Task<BoardResponse?> UpdateBoard(string id, UpdateBoardDto dto)
    {
        var entity = await _db.Boards.FirstOrDefaultAsync(b => b.Id == id);
        if (entity == null) return null;

        if (dto.Numbers is { Length: > 0 })
        {
            // validate new numbers if provided
            ValidateNumbers(dto.Numbers);
            entity.Numbers = dto.Numbers.ToList();

        }

        // Map other updatable fields (e.g. RepeatId) via AutoMapper
        _mapper.Map(dto, entity);

        await _db.SaveChangesAsync();
        return _mapper.Map<BoardResponse>(entity);
    }

    // -----------------------------
    // Helpers
    // -----------------------------
    private static void ValidateNumbers(int[] numbers)
    {
        if (numbers.Length < 5 || numbers.Length > 8)
            throw new InvalidOperationException("Board must have between 5 and 8 numbers.");

        if (numbers.Any(n => n < 1 || n > 16))
            throw new InvalidOperationException("Numbers must be between 1 and 16.");
    }

    private static bool IsJoinClosed(Game game)
    {
        // 1) If the DB join deadline is set, use it
        if (game.Joindeadline.HasValue)
        {
            // Assume stored as UTC
            return DateTime.UtcNow > game.Joindeadline.Value;
        }

        // 2) Otherwise: Saturday 17:00 local Danish time of that game week
        // Use ISO week (System.Globalization.ISOWeek)
        var saturdayLocal = System.Globalization.ISOWeek.ToDateTime(
            game.Year,
            game.Weeknumber,
            DayOfWeek.Saturday);

        saturdayLocal = saturdayLocal.Date.AddHours(17); // 17:00 local

        // Convert to UTC assuming Europe/Copenhagen
        var dkTz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");
        var deadlineUtc = TimeZoneInfo.ConvertTimeToUtc(saturdayLocal, dkTz);

        return DateTime.UtcNow > deadlineUtc;
    }
}
