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
}
