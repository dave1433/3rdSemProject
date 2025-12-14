using api.dtos.Requests;
using api.dtos.Responses;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AdminGameService : IAdminGameService
{
    private readonly MyDbContext _db;
    private readonly IBoardService _boards;

    public AdminGameService(MyDbContext db, IBoardService boards)
    {
        _db     = db;
        _boards = boards;
    }

    // --------------------------------------------------
    // ENTER WINNING NUMBERS
    // --------------------------------------------------
    public async Task<GameResponse> EnterWinningNumbersAsync(CreateGameDrawRequest request)
    {
        ValidateRequest(request);
        await EnsureWeekNotLocked(request.Year, request.WeekNumber);

        var game = await CreateGameAsync(request);

        await EvaluateWinnersAsync(game);

        return MapToResponse(game);
    }

    // --------------------------------------------------
    // PUBLIC QUERIES
    // --------------------------------------------------
    public async Task<bool> IsWeekLockedAsync(int year, int weekNumber)
    {
        return await _db.Games.AnyAsync(g =>
            g.Year == year &&
            g.Weeknumber == weekNumber &&
            g.Winningnumbers != null &&
            g.Winningnumbers.Count > 0);
    }

    public async Task<List<WeeklyBoardSummaryDto>> GetWeeklyWinningSummaryAsync()
    {
        return await _boards.GetWeeklyWinningSummaryAsync();
    }

    public async Task<List<GameHistoryResponse>> GetDrawHistoryAsync()
    {
        return await _db.Games
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
    }

    // ==================================================
    // PRIVATE SERVICE LOGIC
    // ==================================================

    private static void ValidateRequest(CreateGameDrawRequest request)
    {
        if (request.WinningNumbers == null || request.WinningNumbers.Count != 3)
            throw new ArgumentException("Exactly 3 winning numbers are required.");

        if (request.WinningNumbers.Any(n => n < 1 || n > 16))
            throw new ArgumentException("Winning numbers must be between 1 and 16.");

        if (request.WinningNumbers.Distinct().Count() != 3)
            throw new ArgumentException("Winning numbers must be unique.");
    }

    private async Task EnsureWeekNotLocked(int year, int weekNumber)
    {
        var locked = await _db.Games.AnyAsync(g =>
            g.Year == year &&
            g.Weeknumber == weekNumber &&
            g.Winningnumbers != null);

        if (locked)
            throw new InvalidOperationException(
                $"Winning numbers already locked for {year} week {weekNumber}");
    }

    private async Task<Game> CreateGameAsync(CreateGameDrawRequest request)
    {
        var game = new Game
        {
            Id             = Guid.NewGuid().ToString(),
            Year           = request.Year,
            Weeknumber     = request.WeekNumber,
            Winningnumbers = request.WinningNumbers,
            Createdat      = DateTime.UtcNow,
            Joindeadline   = CalculateJoinDeadline(request.Year, request.WeekNumber)
        };

        _db.Games.Add(game);
        await _db.SaveChangesAsync();

        return game;
    }

    private async Task EvaluateWinnersAsync(Game game)
    {
        var winning = game.Winningnumbers!.ToHashSet();

        var boards = await _db.Boards
            .Where(b => b.Gameid == game.Id)
            .ToListAsync();

        foreach (var board in boards)
            board.Iswinner = winning.All(n => board.Numbers.Contains(n));

        await _db.SaveChangesAsync();
    }

    private static GameResponse MapToResponse(Game game) =>
        new()
        {
            Id = game.Id,
            Year = game.Year,
            WeekNumber = game.Weeknumber,
            WinningNumbers = game.Winningnumbers!,
            CreatedAt = game.Createdat!.Value
        };

    // --------------------------------------------------
    // TIME / ISO WEEK LOGIC
    // --------------------------------------------------
    private static DateTime CalculateJoinDeadline(int year, int week)
    {
#if WINDOWS
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Romance Standard Time");
#else
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");
#endif
        var jan4 = new DateTime(year, 1, 4);
        int day  = (int)jan4.DayOfWeek;
        if (day == 0) day = 7;

        var monday = jan4.AddDays(1 - day).AddDays((week - 1) * 7);
        var saturday = monday.AddDays(5).AddHours(16).AddMinutes(59).AddSeconds(59);

        return TimeZoneInfo.ConvertTimeToUtc(saturday, tz);
    }
}
