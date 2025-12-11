using api.dtos.Requests;
using api.dtos.Responses;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class RepeatService : IRepeatService
{
private readonly MyDbContext _db;

    public RepeatService(MyDbContext db)
    {
        _db = db;
    }

    ///Create new repeat + first board
    public async Task<RepeatDtoResponse> CreateAsync(string playerId, CreateRepeatRequest request, CancellationToken ct = default)
    {
        if (request.Numbers == null || request.Numbers.Count == 0)
            throw new ArgumentException("Numbers must not be empty.", nameof(request.Numbers));

        if (request.Numbers.Count < 5 || request.Numbers.Count > 8)
            throw new ArgumentException("Numbers must be between 5 and 8.", nameof(request.Numbers));

        if (request.Times <= 0)
            throw new ArgumentException("Times must be positive.", nameof(request.Times));

        if (request.Weeks <= 0)
            throw new ArgumentException("Weeks must be positive.", nameof(request.Weeks));

        // 1. Find "current" game 
        var now = DateTime.UtcNow;
        var currentGame = await _db.Games
            .OrderByDescending(g => g.Year)
            .ThenByDescending(g => g.Weeknumber)
            .FirstOrDefaultAsync(ct);

        if (currentGame == null)
            throw new InvalidOperationException("No game is available to attach repeat to.");

        // 2. Get price-per-board from boardprice table
        var fieldsCount = request.Numbers.Count;

        var boardPriceRow = await _db.Boardprices
            .FirstOrDefaultAsync(bp => bp.Fieldscount == fieldsCount, ct);

        if (boardPriceRow == null)
            throw new InvalidOperationException($"No price configured for {fieldsCount} fields.");

        var basePrice = boardPriceRow.Price;              // price for 1 board with that many fields
        var pricePerWeek = basePrice * request.Times;     // includes Times

        // 3. Create Repeat row
        var repeatId = Guid.NewGuid().ToString();

        var repeat = new Repeat
        {
            Id = repeatId,
            Playerid = playerId,
            Numbers = request.Numbers,
            // We'll store price per week (for this repeat)
            Price = pricePerWeek,
            Remainingweeks = Math.Max(request.Weeks - 1, 0), // we create this week's board below
            Optout = false,
            Createdat = DateTime.UtcNow
        };

        _db.Repeats.Add(repeat);

        // 4. Create initial Board for the current week
        var board = new Board
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = playerId,
            Gameid = currentGame.Id,
            Numbers = request.Numbers,
            Price = pricePerWeek,
            Times = request.Times,
            Repeatid = repeatId,
            Createdat = DateTime.UtcNow
        };

        _db.Boards.Add(board);

        // 5. Optionally, create a transaction entry (purchase)
        var transaction = new Transaction
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = playerId,
            Type = "purchase",
            Amount = -pricePerWeek,
            Status = "approved",
            Boardid = board.Id,
            Createdat = DateTime.UtcNow
        };

        _db.Transactions.Add(transaction);

        await _db.SaveChangesAsync(ct);

        return await MapToResponseAsync(repeat, ct);
    }

    /// Get all repeats for a player
    public async Task<IReadOnlyList<RepeatDtoResponse>> GetByPlayerAsync(string playerId, CancellationToken ct = default)
    {
        var repeats = await _db.Repeats
            .Where(r => r.Playerid == playerId)
            .OrderByDescending(r => r.Createdat)
            .ToListAsync(ct);

        var list = new List<RepeatDtoResponse>(repeats.Count);

        foreach (var repeat in repeats)
        {
            list.Add(await MapToResponseAsync(repeat, ct));
        }

        return list;
    }

    /// Player stops auto-renew
    public async Task StopAsync(string playerId, string repeatId, CancellationToken ct = default)
    {
        var repeat = await _db.Repeats
            .FirstOrDefaultAsync(r => r.Id == repeatId && r.Playerid == playerId, ct);

        if (repeat == null)
            throw new KeyNotFoundException("Repeat not found for this player.");

        if (repeat.Optout && repeat.Remainingweeks == 0)
            return; // already cancelled / finished

        repeat.Optout = true;
        repeat.Remainingweeks = 0;

        await _db.SaveChangesAsync(ct);
    }
    
    /// Generate boards for a new week
    public async Task GenerateBoardsForGameAsync(string gameId, CancellationToken ct = default)
    {
        var game = await _db.Games.FirstOrDefaultAsync(g => g.Id == gameId, ct);
        if (game == null)
            throw new KeyNotFoundException("Game not found.");

        // Load all active repeats
        var activeRepeats = await _db.Repeats
            .Where(r => !r.Optout && r.Remainingweeks > 0)
            .ToListAsync(ct);

        if (activeRepeats.Count == 0)
            return;

        // Preload boardprice as dictionary: fields -> base price
        var prices = await _db.Boardprices.ToListAsync(ct);
        var priceMap = prices.ToDictionary(p => p.Fieldscount, p => p.Price);

        foreach (var repeat in activeRepeats)
        {
            var numbers = repeat.Numbers ?? new List<int>();
            if (numbers.Count == 0)
                continue;

            if (!priceMap.TryGetValue(numbers.Count, out var basePrice))
                continue; // misconfigured repeat / price table

            // Deduce Times from repeat.Price
            // repeat.Price = basePrice * Times
            if (basePrice <= 0) continue;
            var times = repeat.Price / basePrice;
            if (times <= 0) times = 1;

            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Gameid = game.Id,
                Numbers = numbers,
                Price = repeat.Price,
                Times = times,
                Repeatid = repeat.Id,
                Createdat = DateTime.UtcNow
            };

            _db.Boards.Add(board);

            // Create a purchase transaction for this auto-generated board
            var transaction = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Type = "purchase",
                Amount = -repeat.Price,
                Status = "approved",
                Boardid = board.Id,
                Createdat = DateTime.UtcNow
            };

            _db.Transactions.Add(transaction);

            // Decrement remaining weeks
            repeat.Remainingweeks--;
            if (repeat.Remainingweeks <= 0)
            {
                repeat.Remainingweeks = 0;
                // Optionally mark as opted-out to treat as completed
                // repeat.Optout = true;
            }
        }

        await _db.SaveChangesAsync(ct);
    }

    // ---------------------------------------
    // Helper: map Repeat -> RepeatResponse
    // ---------------------------------------
    private async Task<RepeatDtoResponse> MapToResponseAsync(Repeat repeat, CancellationToken ct)
    {
        var repeatId = repeat.Id;

        // How many boards already created from this repeat?
        var boardsCount = await _db.Boards
            .CountAsync(b => b.Repeatid == repeatId, ct);

        var totalWeeks = boardsCount + repeat.Remainingweeks;

        var status = (!repeat.Optout && repeat.Remainingweeks > 0)
            ? "Active"
            : "Inactive";

        return new RepeatDtoResponse
        {
            Id = repeat.Id,
            PlayerId = repeat.Playerid ?? string.Empty,
            Numbers = repeat.Numbers ?? new List<int>(),
            Price = repeat.Price,
            RemainingWeeks = repeat.Remainingweeks,
            OptOut = repeat.Optout,
            CreatedAt = repeat.Createdat,
            PlayedWeeks = boardsCount,
            TotalWeeks = totalWeeks,
            Status = status
        };
    }
}
