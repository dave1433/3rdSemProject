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

    public AdminGameController(
        MyDbContext db,
        IBoardService boardService)
    {
        _db = db;
        _boardService = boardService;
    }

    /// <summary>
    /// Enter winning numbers for a specific ISO week.
    /// This operation is LOCKED per (Year + WeekNumber).
    /// </summary>
    [HttpPost("draw")]
    public async Task<ActionResult<GameResponse>> EnterWinningNumbers(
        CreateGameDrawRequest request)
    {
        // -----------------------------
        // Validation
        // -----------------------------
        if (request.WinningNumbers.Count != 3)
            return BadRequest("Exactly 3 winning numbers are required");

        if (request.WinningNumbers.Any(n => n < 1 || n > 16))
            return BadRequest("Winning numbers must be between 1 and 16");

        // -----------------------------
        // LOCK: only one draw per week
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
        // Time calculations
        // -----------------------------
        var createdAtUtc = DateTime.UtcNow; // now
        var startAtUtc   = createdAtUtc;    // you want startAt == createdAt

        // Monday 00:00 of that ISO week in Copenhagen local time
        var weekStartLocal = FirstDayOfIsoWeekLocal(request.Year, request.WeekNumber);

        // Saturday 16:59:59 in that week (still local time)
        var joinDeadlineLocal = weekStartLocal
            .AddDays(5)                   // Monday + 5 days = Saturday
            .AddHours(16)
            .AddMinutes(59)
            .AddSeconds(59);

        // convert local (Europe/Copenhagen) to UTC before saving in timestamptz
        var joinDeadlineUtc = TimeZoneInfo.ConvertTimeToUtc(
            joinDeadlineLocal,
            CphTz);
        
        

        // -----------------------------
        // Create game draw
        // -----------------------------
        var game = new Game
        {
            Id = Guid.NewGuid().ToString(),
            Year = request.Year,
            Weeknumber = request.WeekNumber,
            Winningnumbers = request.WinningNumbers,
            Createdat = DateTime.UtcNow
        };

        _db.Games.Add(game);

        // ✅ FIRST SAVE — game must exist in DB
        await _db.SaveChangesAsync();

        // =====================================================
        // ✅ EVALUATE WINNING BOARDS
        // =====================================================
        var boards = await _db.Boards
            .Where(b => b.Gameid == game.Id)
            .ToListAsync();

        var winningSet = game.Winningnumbers!.ToHashSet();

        foreach (var board in boards)
        {
            // A board wins if it contains ALL winning numbers
            board.Iswinner = winningSet.All(n => board.Numbers.Contains(n));
        }

        // ✅ SAVE WIN RESULTS
        await _db.SaveChangesAsync();

        // -----------------------------
        // NEW: generate boards for all active repeats
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

    /// <summary>
    /// Used by frontend to check if draw is locked
    /// </summary>
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

    /// <summary>
    /// Weekly total of winning boards (admin only)
    /// </summary>
    [HttpGet("winners/summary")]
    [Authorize(Roles = "1")]
    public async Task<ActionResult<List<WeeklyBoardSummaryDto>>> GetWeeklyWinningSummary()
    {
        var result = await _boardService.GetWeeklyWinningSummaryAsync();
        return Ok(result);
    }

    /// <summary>
    /// Draw history for admin UI
    /// </summary>
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

    // ==========================================================
    // generate boards for all active repeats
    // for this game (week)
    // ==========================================================
    private async Task GenerateBoardsForRepeatsAsync(Game game, CancellationToken ct = default)
    {
        // 1) Find all active repeats:
        //    - not opted out
        //    - still have remaining weeks
        var activeRepeats = await _db.Repeats
            .Where(r => !r.Optout && r.Remainingweeks > 0)
            .ToListAsync(ct);

        if (activeRepeats.Count == 0)
            return;

        // 2) Load board prices (fieldsCount -> basePrice)
        var prices = await _db.Boardprices.ToListAsync(ct);
        var priceMap = prices.ToDictionary(p => p.Fieldscount, p => p.Price);

        foreach (var repeat in activeRepeats)
        {
            var numbers = repeat.Numbers ?? new List<int>();
            if (numbers.Count == 0)
                continue;

            // Ensure we have a price for the number of fields
            if (!priceMap.TryGetValue(numbers.Count, out var basePrice))
                continue;

            if (basePrice <= 0)
                continue;

            // repeat.Price = basePrice * times  (times = how many boards per week)
            var times = repeat.Price / basePrice;
            if (times <= 0) times = 1;

            // 3) Create board for this week
            var board = new Board
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Gameid = game.Id,
                Numbers = numbers,
                Price = repeat.Price,   // price per week for this repeat
                Times = times,
                Repeatid = repeat.Id,
                Createdat = DateTime.UtcNow
            };

            _db.Boards.Add(board);

            // 4) (Optional) create transaction for this auto-board
            var transaction = new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = repeat.Playerid,
                Type = "purchase",
                Amount = -repeat.Price,    // money out
                Status = "approved",
                Boardid = board.Id,
                Createdat = DateTime.UtcNow
            };

            _db.Transactions.Add(transaction);

            // 5) Decrease remaining weeks
            repeat.Remainingweeks--;
            if (repeat.Remainingweeks < 0)
            {
                repeat.Remainingweeks = 0;
            }

            // If you want to auto-mark finished repeats:
            // if (repeat.Remainingweeks == 0)
             {
                repeat.Optout = true; // treat as completed
            // }
        }

        await _db.SaveChangesAsync(ct);
    }
    }
    // ==========================================================
    // Time helpers
    // ==========================================================

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
        // ISO-8601: week 1 is the week with Jan 4th in it, week starts Monday
        var jan4 = new DateTime(year, 1, 4);
        var cal = CultureInfo.InvariantCulture.Calendar;

        // Monday of week 1
        int dayOfWeek = (int)jan4.DayOfWeek;
        if (dayOfWeek == 0) dayOfWeek = 7; // Sunday -> 7
        var week1Monday = jan4.AddDays(1 - dayOfWeek);

        var utcMonday = week1Monday.AddDays((week - 1) * 7);

        // We want Monday 00:00 in Copenhagen local
        var localMonday = TimeZoneInfo.ConvertTimeFromUtc(utcMonday, CphTz);
        return new DateTime(
            localMonday.Year,
            localMonday.Month,
            localMonday.Day,
            0, 0, 0,
            localMonday.Kind);
    }
        
}


