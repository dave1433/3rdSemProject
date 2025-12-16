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

    // --------------------------------------------------
    // CREATE REPEAT + FIRST BOARD
    // --------------------------------------------------
    public async Task<RepeatDtoResponse> CreateAsync(
        string playerId,
        CreateRepeatRequest request,
        CancellationToken ct = default)
    {
        if (request.Numbers == null || request.Numbers.Count == 0)
            throw new ArgumentException("Numbers must not be empty.");

        if (request.Numbers.Count < 5 || request.Numbers.Count > 8)
            throw new ArgumentException("Numbers must be between 5 and 8.");

        if (request.Times <= 0)
            throw new ArgumentException("Times must be positive.");

        if (request.Weeks <= 0)
            throw new ArgumentException("Weeks must be positive.");

        var currentGame = await _db.Games
            .OrderByDescending(g => g.Year)
            .ThenByDescending(g => g.Weeknumber)
            .FirstOrDefaultAsync(ct);

        if (currentGame == null)
            throw new InvalidOperationException("No game available.");

        var fields = request.Numbers.Count;

        var boardPriceRow = await _db.Boardprices
            .FirstOrDefaultAsync(bp => bp.Fieldscount == fields, ct);

        if (boardPriceRow == null)
            throw new InvalidOperationException($"No price configured for {fields} fields.");

        var pricePerWeek = boardPriceRow.Price * request.Times;

        var repeatId = Guid.NewGuid().ToString();

        var repeat = new Repeat
        {
            Id = repeatId,
            Playerid = playerId,
            Numbers = request.Numbers,
            Price = pricePerWeek,
            Remainingweeks = Math.Max(request.Weeks - 1, 0),
            Optout = false,
            Createdat = DateTime.UtcNow
        };

        _db.Repeats.Add(repeat);

        var board = new Board
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = playerId,
            Gameid = currentGame.Id,
            Numbers = request.Numbers,
            Times = request.Times,
            Price = pricePerWeek,
            Repeatid = repeatId,
            Createdat = DateTime.UtcNow
        };

        _db.Boards.Add(board);

        _db.Transactions.Add(new Transaction
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = playerId,
            Type = "purchase",
            Amount = -pricePerWeek,
            Status = "approved",
            Boardid = board.Id,
            Createdat = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);

        return await MapToResponseAsync(repeat, ct);
    }

    // --------------------------------------------------
    // GET PLAYER REPEATS
    // --------------------------------------------------
    public async Task<IReadOnlyList<RepeatDtoResponse>> GetByPlayerAsync(
        string playerId,
        CancellationToken ct = default)
    {
        var repeats = await _db.Repeats
            .Where(r => r.Playerid == playerId)
            .OrderByDescending(r => r.Createdat)
            .ToListAsync(ct);

        var result = new List<RepeatDtoResponse>();

        foreach (var repeat in repeats)
            result.Add(await MapToResponseAsync(repeat, ct));

        return result;
    }

    // --------------------------------------------------
    // STOP REPEAT
    // --------------------------------------------------
    public async Task StopAsync(
        string playerId,
        string repeatId,
        CancellationToken ct = default)
    {
        var repeat = await _db.Repeats
            .FirstOrDefaultAsync(r => r.Id == repeatId && r.Playerid == playerId, ct);

        if (repeat == null)
            throw new KeyNotFoundException("Repeat not found.");

        repeat.Optout = true;
        repeat.Remainingweeks = 0;

        await _db.SaveChangesAsync(ct);
    }

    // --------------------------------------------------
    // PROCESS REPEATS WHEN GAME STARTS
    // --------------------------------------------------
    public async Task GenerateBoardsForGameAsync(
        string gameId,
        CancellationToken ct = default)
    {
    var game = await _db.Games.FirstOrDefaultAsync(g => g.Id == gameId, ct);
    if (game == null)
        throw new KeyNotFoundException("Game not found.");

    // Game must be started (winning numbers set)
    if (game.Winningnumbers == null || game.Winningnumbers.Count == 0)
        return;

    var repeats = await _db.Repeats
        .Where(r =>
            !r.Optout &&
            r.Remainingweeks > 0 &&
            r.Createdat < game.Createdat) // ⏱️ FIX: repeat must predate this game
        .ToListAsync(ct);

    if (repeats.Count == 0)
        return;

    var prices = await _db.Boardprices.ToDictionaryAsync(
        p => p.Fieldscount,
        p => p.Price,
        ct);

    foreach (var repeat in repeats)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        try
        {
            // 🔒 IDEMPOTENCY GUARD
            var alreadyProcessed = await _db.Boards.AnyAsync(
                b => b.Gameid == gameId && b.Repeatid == repeat.Id,
                ct);

            if (alreadyProcessed)
            {
                await tx.RollbackAsync(ct);
                continue;
            }

            var numbers = repeat.Numbers ?? new List<int>();
            if (!prices.TryGetValue(numbers.Count, out var basePrice))
            {
                await tx.RollbackAsync(ct);
                continue;
            }

            var times = repeat.Price / basePrice;
            if (times <= 0) times = 1;

            var total = basePrice * times;

            // Lock user row
            var player = await _db.Users
                .FromSqlInterpolated($@"
                    select * from deadpigeons.""user""
                    where id = {repeat.Playerid} for update")
                .SingleAsync(ct);

            // ❌ Insufficient balance → stop repeat
            if (player.Balance < total)
            {
                _db.Transactions.Add(new Transaction
                {
                    Id = Guid.NewGuid().ToString(),
                    Playerid = repeat.Playerid,
                    Type = "purchase",
                    Amount = -total,
                    Status = "rejected",
                    Createdat = DateTime.UtcNow
                });

                repeat.Optout = true;
                repeat.Remainingweeks = 0;

                await _db.SaveChangesAsync(ct);
                await tx.CommitAsync(ct);
                continue;
            }

            // ✅ Create board
            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Gameid = gameId,
                Numbers = numbers,
                Times = times,
                Price = total,
                Repeatid = repeat.Id,
                Createdat = DateTime.UtcNow
            };

            _db.Boards.Add(board);

            // Deduct balance
            player.Balance -= total;

            _db.Transactions.Add(new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Type = "purchase",
                Amount = -total,
                Status = "approved",
                Boardid = board.Id,
                Createdat = DateTime.UtcNow
            });

            repeat.Remainingweeks--;
            if (repeat.Remainingweeks <= 0)
            {
                repeat.Remainingweeks = 0;
                repeat.Optout = true;
            }

            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }
    }

    // --------------------------------------------------
    // MAP TO DTO
    // --------------------------------------------------
    private async Task<RepeatDtoResponse> MapToResponseAsync(
        Repeat repeat,
        CancellationToken ct)
    {
        var playedWeeks = await _db.Boards
            .CountAsync(b => b.Repeatid == repeat.Id, ct);

        return new RepeatDtoResponse
        {
            Id = repeat.Id,
            PlayerId = repeat.Playerid ?? "",
            Numbers = repeat.Numbers ?? new(),
            Price = repeat.Price,
            RemainingWeeks = repeat.Remainingweeks,
            OptOut = repeat.Optout,
            CreatedAt = repeat.Createdat,
            PlayedWeeks = playedWeeks,
            TotalWeeks = playedWeeks + repeat.Remainingweeks,
            Status = (!repeat.Optout && repeat.Remainingweeks > 0)
                ? "Active"
                : "Inactive"
        };
    }
}
