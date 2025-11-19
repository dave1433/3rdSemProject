using api.Dtos.Requests;
using api.Dtos.Responses;
using AutoMapper;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class RepeatService : IRepeatService
{
    private readonly MyDbContext _db;
    private readonly IMapper _mapper;

    public RepeatService(MyDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // -----------------------------
    // Admin
    // -----------------------------
    public async Task<IEnumerable<RepeatResponse>> GetAllRepeats()
    {
        var repeats = await _db.Repeats.AsNoTracking().ToListAsync();
        return _mapper.Map<IEnumerable<RepeatResponse>>(repeats);
    }

    public async Task<RepeatResponse?> GetRepeatById(string id)
    {
        var repeat = await _db.Repeats.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        return repeat == null ? null : _mapper.Map<RepeatResponse>(repeat);
    }

    public async Task<bool> DeleteRepeat(string id)
    {
        var entity = await _db.Repeats.FirstOrDefaultAsync(r => r.Id == id);
        if (entity == null) return false;

        _db.Repeats.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }

    // -----------------------------
    // Player + Admin
    // -----------------------------
    public async Task<IEnumerable<RepeatResponse>> GetRepeatsByPlayer(string playerId)
    {
        var repeats = await _db.Repeats.AsNoTracking()
            .Where(r => r.Playerid == playerId)
            .ToListAsync();

        return _mapper.Map<IEnumerable<RepeatResponse>>(repeats);
    }

    public async Task<RepeatResponse> CreateRepeat(CreateRepeatDto dto)
    {
        ValidateNumbers(dto.Numbers);

        // Validate player exists + active
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Id == dto.PlayerId);
        if (player == null)
            throw new InvalidOperationException("Player not found.");
        if (!player.Active)
            throw new InvalidOperationException("Player is not active.");

        // Fetch price from BoardPrice (same as board)
        var boardPrice = await _db.Boardprices
            .AsNoTracking()
            .FirstOrDefaultAsync(bp => bp.Fieldscount == dto.Numbers.Length);

        if (boardPrice == null)
            throw new InvalidOperationException("Invalid number count for board price.");

        var entity = _mapper.Map<Repeat>(dto);
        entity.Numbers = dto.Numbers.ToList();

        entity.Id = Guid.NewGuid().ToString();
        entity.Price = boardPrice.Price;
        entity.Createdat = DateTime.UtcNow;
        entity.Optout = false;

        _db.Repeats.Add(entity);
        await _db.SaveChangesAsync();

        return _mapper.Map<RepeatResponse>(entity);
    }

    public async Task<RepeatResponse?> UpdateRepeat(string id, UpdateRepeatDto dto)
    {
        var repeat = await _db.Repeats.FirstOrDefaultAsync(r => r.Id == id);
        if (repeat == null) return null;

        // If numbers change, validate + recalc price
        if (dto.Numbers != null)
        {
            ValidateNumbers(dto.Numbers);

            var boardPrice = await _db.Boardprices
                .AsNoTracking()
                .FirstOrDefaultAsync(bp => bp.Fieldscount == dto.Numbers.Length);

            if (boardPrice == null)
                throw new InvalidOperationException("Invalid number count for board price.");

            repeat.Numbers = dto.Numbers.ToList();

            repeat.Price = boardPrice.Price; // update price
        }

        if (dto.RemainingWeeks.HasValue)
            repeat.Remainingweeks = dto.RemainingWeeks.Value;

        if (dto.OptOut.HasValue)
            repeat.Optout = dto.OptOut.Value;

        await _db.SaveChangesAsync();

        return _mapper.Map<RepeatResponse>(repeat);
    }

    // -----------------------------
    // Helpers
    // -----------------------------
    private static void ValidateNumbers(int[] numbers)
    {
        if (numbers.Length < 5 || numbers.Length > 8)
            throw new InvalidOperationException("Repeat setup must have 5–8 numbers.");

        if (numbers.Any(n => n < 1 || n > 16))
            throw new InvalidOperationException("Numbers must be between 1 and 16.");
    }
}
