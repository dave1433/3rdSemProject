using api.Services;
using api.dtos.Requests;
using api.Errors;
using Xunit;

[Collection("Postgres")]
public class AdminGameServiceTests
{
    private readonly PostgresFixture _db;

    public AdminGameServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    // ----------------------------
    // HAPPY PATH
    // ----------------------------
    [Fact]
    public async Task EnterWinningNumbersAsync_CreatesGame_AndCallsRepeatService()
    {
        using var ctx = _db.CreateContext();

        var repeat = new FakeRepeatService();
        var boards = new FakeBoardService();

        var service = new AdminGameService(ctx, boards, repeat);

        var request = new CreateGameDrawRequest
        {
            Year = 2025,
            WeekNumber = 10,
            WinningNumbers = new List<int> { 1, 5, 9 }
        };

        var result = await service.EnterWinningNumbersAsync(request);

        Assert.NotNull(result);
        Assert.Equal(2025, result.Year);
        Assert.True(repeat.WasCalled);
    }

    // ----------------------------
    // INVALID WINNING NUMBERS
    // ----------------------------
    [Fact]
    public async Task EnterWinningNumbersAsync_ThrowsBadRequest_WhenWinningNumbersInvalid()
    {
        using var ctx = _db.CreateContext();

        var service = new AdminGameService(
            ctx,
            new FakeBoardService(),
            new FakeRepeatService());

        var request = new CreateGameDrawRequest
        {
            Year = 2025,
            WeekNumber = 10,
            WinningNumbers = new List<int> { 1, 1, 1 }
        };

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            service.EnterWinningNumbersAsync(request)
        );

        Assert.Equal(400, ex.StatusCode);
    }

    // ----------------------------
    // WEEK LOCKED
    // ----------------------------
    [Fact]
    public async Task EnterWinningNumbersAsync_ThrowsConflict_WhenWeekAlreadyLocked()
    {
        using var ctx = _db.CreateContext();

        var service = new AdminGameService(
            ctx,
            new FakeBoardService(),
            new FakeRepeatService());

        var request = new CreateGameDrawRequest
        {
            Year = 2025,
            WeekNumber = 11,
            WinningNumbers = new List<int> { 1, 2, 3 }
        };

        // First call locks the week
        await service.EnterWinningNumbersAsync(request);

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            service.EnterWinningNumbersAsync(request)
        );

        Assert.Equal(409, ex.StatusCode);
    }
}
