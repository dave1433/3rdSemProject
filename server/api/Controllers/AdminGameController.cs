using System.Globalization;
using api.dtos.Requests;
using api.dtos.Responses;
using api.Services;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.controllers;

[ApiController]
[Route("api/admin/games")]
public class AdminGameController : ControllerBase
{
    private readonly MyDbContext _db;
    private readonly IBoardService _boardService;

    public AdminGameController(MyDbContext db, IBoardService boardService)
    {
        _db = db;
        _boardService = boardService;
    }

    // ---------------------------------------------------------------------
    // ENTER WINNING NUMBERS FOR WEEK (LOCKED PER YEAR+WEEK)
    // ---------------------------------------------------------------------
    [HttpPost("draw")]
    public async Task<ActionResult<GameResponse>> EnterWinningNumbers(CreateGameDrawRequest request)
    {
        // -----------------------------
        // Validation
        // -----------------------------
        if (request.WinningNumbers.Count != 3)
            return BadRequest("Exactly 3 winning numbers are required.");

        if (request.WinningNumbers.Any(n => n < 1 || n > 16))
            return BadRequest("Winning numbers must be between 1 and 16.");

        // -----------------------------
        // LOCK: Prevent re-draw for same week
        // -----------------------------
        var alreadyDrawn = await _db.Games
            .AsNoTracking()
            .AnyAsync(g =>
                g.Year == request.Year &&
                g.Weeknumber == request.WeekNumber &&
                g.Winningnumbers != null);

        if (alreadyDrawn)
        {
            return Conflict(
                $"Winning numbers are already locked for year {request.Year}, week {request.WeekNumber}");
        }

        // -----------------------------
        // Date calculations (Copenhagen)
        // -----------------------------
        var createdAtUtc = DateTime.UtcNow;

        // Monday 00:00 local time for this ISO week
        var weekStartLocal = FirstDayOfIsoWeekLocal(request.Year, request.WeekNumber);

        // Deadline: Saturday 16:59:59 local
        var joinDeadlineLocal = weekStartLocal
            .AddDays(5) // Monday + 5 days = Saturday
            .AddHours(16)
            .AddMinutes(59)
            .AddSeconds(59);

        var joinDeadlineUtc = TimeZoneInfo.ConvertTimeToUtc(joinDeadlineLocal, CphTz);

        // -----------------------------
        // Create game draw
        // -----------------------------
        var game = new Game
        {
            Id = Guid.NewGuid().ToString(),
            Year = request.Year,
            Weeknumber = request.WeekNumber,
            Winningnumbers = request.WinningNumbers,
            Createdat = createdAtUtc,
            Joindeadline = joinDeadlineUtc       // ✅ MISSING IN YOUR VERSION — ADDED
        };

        _db.Games.Add(game);

        // Save game first (so GameId is available)
        await _db.SaveChangesAsync();

        // -----------------------------
        // Evaluate winning boards
        // -----------------------------
        var boards = await _db.Boards
            .Where(b => b.Gameid == game.Id)
            .ToListAsync();

        var winningSet = game.Winningnumbers!.ToHashSet();

        foreach (var board in boards)
        {
            board.Iswinner = winningSet.All(n => board.Numbers.Contains(n));
        }

        await _db.SaveChangesAsync();

        // -----------------------------
        // Generate repeat boards for this week
        // -----------------------------
        await GenerateBoardsForRepeatsAsync(game);

        // -----------------------------
        // Response
        // -----------------------------
        return Ok(new GameResponse
        {
            Id = game.Id,
            Year = game.Year,
            WeekNumber = game.Weeknumber,
            WinningNumbers = game.Winningnumbers!,
            CreatedAt = game.Createdat!.Value
        });
    }

    // ---------------------------------------------------------------------
    // CHECK IF A WEEK IS LOCKED
    // ---------------------------------------------------------------------
    [HttpGet("draw/status")]
    public async Task<ActionResult<bool>> IsWeekLocked(int year, int weekNumber)
    {
        var locked = await _db.Games
            .AsNoTracking()
            .AnyAsync(g =>
                g.Year == year &&
                g.Weeknumber == weekNumber &&
                g.Winningnumbers != null);

        return Ok(locked);
    }

    // ---------------------------------------------------------------------
    // WEEKLY WIN SUMMARY FOR ADMIN DASHBOARD
    // ---------------------------------------------------------------------
    [HttpGet("winners/summary")]
    [Authorize(Roles = "1")]
    public async Task<ActionResult<List<WeeklyBoardSummaryDto>>> GetWeeklyWinningSummary()
    {
        return Ok(await _boardService.GetWeeklyWinningSummaryAsync());
    }

    // ---------------------------------------------------------------------
    // ADMIN — DRAW HISTORY
    // ---------------------------------------------------------------------
    [HttpGet("draw/history")]
    public async Task<ActionResult<List<GameHistoryResponse>>> GetDrawHistory()
    {
        var history = await _db.Games
            .AsNoTracking()
            .Where(g => g.Winningnumbers != null)
            .OrderByDescending(g => g.Year)
            .ThenByDescending(g => g.Weeknumber)
            .Select(g => new GameHistoryResponse
            {
                Id = g.Id,
                Year = g.Year,
                WeekNumber = g.Weeknumber,
                WinningNumbers = g.Winningnumbers!,
                CreatedAt = g.Createdat!.Value
            })
            .ToListAsync();

        return Ok(history);
    }

    // ---------------------------------------------------------------------
    // REPEAT SYSTEM — AUTO-GENERATE BOARDS FOR NEW WEEK
    // ---------------------------------------------------------------------
    private async Task GenerateBoardsForRepeatsAsync(Game game, CancellationToken ct = default)
    {
        var repeats = await _db.Repeats
            .Where(r => !r.Optout && r.Remainingweeks > 0)
            .ToListAsync(ct);

        if (repeats.Count == 0)
            return;

        var priceList = await _db.Boardprices.ToListAsync(ct);
        var priceMap = priceList.ToDictionary(p => p.Fieldscount, p => p.Price);

        foreach (var repeat in repeats)
        {
            var numbers = repeat.Numbers ?? new List<int>();
            if (numbers.Count == 0) continue;

            if (!priceMap.TryGetValue(numbers.Count, out var basePrice))
                continue;

            // Price per week stored in repeat.Price
            var times = repeat.Price / basePrice;
            if (times <= 0) times = 1;     // safeguard

            // Create auto-board
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

            // Create auto transaction
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

            // Decrease remaining weeks
            repeat.Remainingweeks--;
            if (repeat.Remainingweeks <= 0)
            {
                repeat.Remainingweeks = 0;
                repeat.Optout = true;       // mark repeat as completed
            }
        }

        await _db.SaveChangesAsync(ct);
    }

    // ---------------------------------------------------------------------
    // TIME ZONE HELPERS
    // ---------------------------------------------------------------------
#if WINDOWS
    private static readonly TimeZoneInfo CphTz =
        TimeZoneInfo.FindSystemTimeZoneById("Romance Standard Time");
#else
    private static readonly TimeZoneInfo CphTz =
        TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");
#endif

    /// <summary>
    /// Monday 00:00 of the given ISO week in Copenhagen local time.
    /// </summary>
    private static DateTime FirstDayOfIsoWeekLocal(int year, int week)
    {
        var jan4 = new DateTime(year, 1, 4);
        int dayOfWeek = (int)jan4.DayOfWeek;
        if (dayOfWeek == 0) dayOfWeek = 7;

        var week1Monday = jan4.AddDays(1 - dayOfWeek);
        var utcMonday = week1Monday.AddDays((week - 1) * 7);

        var localMonday = TimeZoneInfo.ConvertTimeFromUtc(utcMonday, CphTz);

        return new DateTime(
            localMonday.Year,
            localMonday.Month,
            localMonday.Day,
            0, 0, 0,
            localMonday.Kind);
    }
}
