using api.Services;
using api.dtos.Requests;
using api.Errors;
using efscaffold.Entities;
using tests.Mocks;
using Xunit;
using System;
using System.Linq;
using System.Threading.Tasks;

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
        using var context = _db.CreateContext();

        var realBoardRepository = new BoardRepository(context);

        var fakeBoardService = new FakeBoardService();
        var fakeRepeatService = new FakeRepeatService();

        var service = new AdminGameService(realBoardRepository, fakeBoardService, fakeRepeatService);

        var request = new CreateGameDrawRequest
        {
            Year = 2025,
            WeekNumber = 10,
            WinningNumbers = new List<int> { 1, 5, 9 }
        };

        var result = await service.EnterWinningNumbersAsync(request);

        Assert.NotNull(result);
        Assert.Equal(2025, result.Year);
        Assert.True(fakeRepeatService.WasCalled);
    }

    // ----------------------------
    // INVALID WINNING NUMBERS
    // ----------------------------
    [Fact]
    public async Task EnterWinningNumbersAsync_ThrowsBadRequest_WhenWinningNumbersInvalid()
    {
        using var ctx = _db.CreateContext();

        var service = new AdminGameService(
            new BoardRepository(ctx),
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
            new BoardRepository(ctx),
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

    [Fact]
    public async Task GetWinningBoardsForUser_ReturnsOnlyWinningBoards()
    {
      var fakeRepo = new FakeBoardRepository();
      var fakeBoardService = new FakeBoardService();
      var fakeRepeatService = new FakeRepeatService();

      var playerId = Guid.NewGuid().ToString();
      var anotherPlayerId = Guid.NewGuid().ToString();
      
      fakeRepo.SetBoards(new List<Board>
      {
        new Board { Playerid = playerId, Iswinner = true },
        new Board { Playerid = playerId, Iswinner = true },
        new Board { Playerid = anotherPlayerId, Iswinner = true },
        new Board { Playerid = playerId, Iswinner = false },
      });
      var service = new AdminGameService(fakeRepo, fakeBoardService, fakeRepeatService);

      var result = await service.GetWinningBoardsForUser(playerId);

      Assert.NotNull(result);
      Assert.Equal(2, result.Count());
      Assert.All(result, board => Assert.Equal(playerId, board.Playerid));
      Assert.All(result, board => Assert.True(board.Iswinner));
    }
}
