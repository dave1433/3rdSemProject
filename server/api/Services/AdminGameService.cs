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

    public async Task<GameResponse> EnterWinningNumbersAsync(CreateGameDrawRequest request)
    {
        // Validation
        if (request.WinningNumbers.Count != 3)
            throw new ArgumentException("Exactly 3 winning numbers required");

        if (request.WinningNumbers.Any(n => n < 1 || n > 16))
            throw new ArgumentException("Numbers must be between 1 and 16");

        // Prevent redraw
        var exists = await _db.Games.AnyAsync(g =>
            g.Year == request.Year &&
            g.Weeknumber == request.WeekNumber &&
            g.Winningnumbers != null);

        if (exists)
            throw new InvalidOperationException("Week is already locked");

        // Create game
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

        // Evaluate winners
        await EvaluateWinners(game);

        return new GameResponse
        {
            Id = game.Id,
            Year = game.Year,
            WeekNumber = game.Weeknumber,
            WinningNumbers = game.Winningnumbers!,
            CreatedAt = game.Createdat!.Value
        };
    }

    private async Task EvaluateWinners(Game game)
    {
        var winning = game.Winningnumbers!.ToHashSet();

        var boards = await _db.Boards
            .Where(b => b.Gameid == game.Id)
            .ToListAsync();

        foreach (var b in boards)
            b.Iswinner = winning.All(n => b.Numbers.Contains(n));

        await _db.SaveChangesAsync();
    }

    public async Task<bool> IsWeekLockedAsync(int year, int weekNumber)
    {
        return await _db.Games.AnyAsync(g =>
            g.Year == year &&
            g.Weeknumber == weekNumber &&
            g.Winningnumbers != null);
    }

    public async Task<List<WeeklyBoardSummaryDto>> GetWeeklyWinningSummaryAsync()
    {
        return await _boards.GetWeeklyWinningSummaryAsync();
    }

    public async Task<List<GameHistoryResponse>> GetDrawHistoryAsync()
    {
        return await _db.Games
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
    }

    private static DateTime CalculateJoinDeadline(int year, int week)
    {
#if WINDOWS
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Romance Standard Time");
#else
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");
#endif

        var jan4 = new DateTime(year, 1, 4);
        var day  = (int)jan4.DayOfWeek;
        if (day == 0) day = 7;

        var monday = jan4.AddDays(1 - day).AddDays((week - 1) * 7);

        var saturday = monday.AddDays(5).AddHours(16).AddMinutes(59).AddSeconds(59);

        return TimeZoneInfo.ConvertTimeToUtc(saturday, tz);
    }
}
