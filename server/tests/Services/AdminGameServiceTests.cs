using api.Services;
using api.dtos.Requests;
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
    // UNHAPPY PATH
    // ----------------------------
    [Fact]
    public async Task EnterWinningNumbersAsync_Throws_WhenWinningNumbersInvalid()
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

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.EnterWinningNumbersAsync(request));
    }

    // ----------------------------
    // WEEK LOCKED
    // ----------------------------
    [Fact]
    public async Task EnterWinningNumbersAsync_Throws_WhenWeekAlreadyLocked()
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

        await service.EnterWinningNumbersAsync(request);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.EnterWinningNumbersAsync(request));
    }
}
