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
[Authorize(Roles = "1")]
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
    public async Task<ActionResult<GameResponse>> EnterWinningNumbers([FromBody] CreateGameDrawRequest request)
    {
        // -----------------------------
        // Validation
        // -----------------------------
        if (request.WinningNumbers == null || request.WinningNumbers.Count != 3)
            return BadRequest("Exactly 3 winning numbers are required.");

        if (request.WinningNumbers.Any(n => n < 1 || n > 16))
            return BadRequest("Winning numbers must be between 1 and 16.");

        if (request.WinningNumbers.Distinct().Count() != 3)
            return BadRequest("Winning numbers must be unique.");

        // -----------------------------
        // LOCK: Prevent re-draw for same week
        // (winningnumbers not null AND length > 0)
        // -----------------------------
        var alreadyDrawn = await _db.Games
            .AsNoTracking()
            .AnyAsync(g =>
                g.Year == request.Year &&
                g.Weeknumber == request.WeekNumber &&
                g.Winningnumbers != null &&
                g.Winningnumbers.Count > 0);

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

        // Deadline: Saturday 16:59:59 local (you can change to 17:00:00 if you want)
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
            Joindeadline = joinDeadlineUtc
        };

        _db.Games.Add(game);

        // Save game first (so GameId is available)
        await _db.SaveChangesAsync();

        // -----------------------------
        // Generate repeat boards for this game/week
        // ✅ IMPORTANT: this will calculate board price from BoardPrice
        // and create transactions with correct negative amount
        // -----------------------------
        await _boardService.ProcessRepeatOrdersForGameAsync(game.Id);

        // -----------------------------
        // Evaluate winning boards (including repeat-generated ones)
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
                g.Winningnumbers != null &&
                g.Winningnumbers.Count > 0);

        return Ok(locked);
    }

    // ---------------------------------------------------------------------
    // WEEKLY WIN SUMMARY FOR ADMIN DASHBOARD
    // ---------------------------------------------------------------------
    [HttpGet("winners/summary")]
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
            .Where(g => g.Winningnumbers != null && g.Winningnumbers.Count > 0)
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
        // ISO week 1 is the week with Jan 4th in it.
        var jan4 = new DateTime(year, 1, 4);
        int dayOfWeek = (int)jan4.DayOfWeek;
        if (dayOfWeek == 0) dayOfWeek = 7; // Sunday => 7

        var week1Monday = jan4.AddDays(1 - dayOfWeek);

        // week start in UTC-like baseline (as your original code did)
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
