using System.Globalization;
using api.Services;
using api.dtos.Requests;
using efscaffold.Entities;
using Xunit;

[Collection("Postgres")]
public class BoardServiceTests
{
    private readonly PostgresFixture _db;

    public BoardServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    // -------------------------------------------------
    // GET BY USER
    // -------------------------------------------------
    [Fact]
    public async Task GetByUserAsync_ReturnsOnlyUsersBoards()
    {
        using var ctx = _db.CreateContext();

        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Users.RemoveRange(ctx.Users);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "u1",
            Email = "user1@test.com",
            Fullname = "User One",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        var other = new User
        {
            Id = "u2",
            Email = "user2@test.com",
            Fullname = "User Two",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        ctx.Users.AddRange(user, other);

        ctx.Boards.AddRange(
            new Board
            {
                Id = "b1",
                Playerid = user.Id,
                Numbers = new List<int> { 1, 2, 3 },
                Createdat = DateTime.UtcNow
            },
            new Board
            {
                Id = "b2",
                Playerid = other.Id,
                Numbers = new List<int> { 4, 5, 6 },
                Createdat = DateTime.UtcNow
            }
        );

        await ctx.SaveChangesAsync();

        var service = new BoardService(ctx);

        var boards = await service.GetByUserAsync(user.Id);

        Assert.Single(boards);
        Assert.Equal("b1", boards[0].Id);
    }

    // -------------------------------------------------
    // ADMIN GET ALL BOARDS
    // -------------------------------------------------
    [Fact]
    public async Task GetAllBoardsForAdminAsync_ReturnsBoardsWithPlayerAndGame()
    {
        using var ctx = _db.CreateContext();

        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Users.RemoveRange(ctx.Users);
        ctx.Games.RemoveRange(ctx.Games);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "u-admin",
            Email = "adminboards@test.com",
            Fullname = "Admin Boards",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        var game = new Game
        {
            Id = "g1",
            Year = 2025,
            Weeknumber = 1,
            Winningnumbers = new List<int> { 1, 2, 3 }
        };

        var board = new Board
        {
            Id = "b-admin",
            Playerid = user.Id,
            Gameid = game.Id,
            Numbers = new List<int> { 1, 2, 3 },
            Createdat = DateTime.UtcNow
        };

        ctx.Users.Add(user);
        ctx.Games.Add(game);
        ctx.Boards.Add(board);
        await ctx.SaveChangesAsync();

        var service = new BoardService(ctx);

        var result = await service.GetAllBoardsForAdminAsync();

        Assert.Single(result);
        Assert.Equal("b-admin", result[0].BoardId);
    }

    // -------------------------------------------------
    // WEEKLY WINNING SUMMARY
    // -------------------------------------------------
    [Fact]
    public async Task GetWeeklyWinningSummaryAsync_GroupsCorrectly()
    {
        using var ctx = _db.CreateContext();

        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Games.RemoveRange(ctx.Games);
        await ctx.SaveChangesAsync();

        var game = new Game
        {
            Id = "g-summary",
            Year = 2025,
            Weeknumber = 10,
            Winningnumbers = new List<int> { 1, 2, 3 }
        };

        ctx.Games.Add(game);

        ctx.Boards.AddRange(
            new Board
            {
                Id = "w1",
                Gameid = game.Id,
                Numbers = new List<int> { 1, 2, 3 },
                Iswinner = true
            },
            new Board
            {
                Id = "w2",
                Gameid = game.Id,
                Numbers = new List<int> { 1, 2, 3 },
                Iswinner = true
            },
            new Board
            {
                Id = "l1",
                Gameid = game.Id,
                Numbers = new List<int> { 4, 5, 6 },
                Iswinner = false
            }
        );

        await ctx.SaveChangesAsync();

        var service = new BoardService(ctx);

        var summary = await service.GetWeeklyWinningSummaryAsync();

        Assert.Single(summary);
        Assert.Equal(2, summary[0].TotalWinningBoards);
        Assert.Equal(10, summary[0].Week);
        Assert.Equal(2025, summary[0].Year);
    }

    // -------------------------------------------------
    // CREATE PURCHASE
    // -------------------------------------------------
    [Fact]
    public async Task CreatePurchaseAsync_CreatesBoards_AndDeductsBalance()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Games.RemoveRange(ctx.Games);
        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        await ctx.SaveChangesAsync();

        var now = DateTime.UtcNow;
        var week = ISOWeek.GetWeekOfYear(now);
        var year = now.Year;

        var user = new User
        {
            Id = "buyer",
            Email = "buyer@test.com",
            Fullname = "Buyer",
            Password = "hashed",
            Role = 2,
            Balance = 200,
            Active = true
        };

        var game = new Game
        {
            Id = "g-buy",
            Year = year,
            Weeknumber = week,
            Winningnumbers = new List<int> { 1, 2, 3 }
        };

        var price = new Boardprice
        {
            Fieldscount = 3,
            Price = 50
        };

        ctx.Users.Add(user);
        ctx.Games.Add(game);
        ctx.Boardprices.Add(price);
        await ctx.SaveChangesAsync();

        var service = new BoardService(ctx);

        var boards = await service.CreatePurchaseAsync(
            user.Id,
            new[]
            {
                new CreateBoardRequest
                {
                    Numbers = new List<int> { 1, 2, 3 },
                    Times = 2
                }
            }
        );

        Assert.Single(boards);

        var updatedUser = ctx.Users.Single(u => u.Id == user.Id);
        Assert.Equal(100, updatedUser.Balance);
    }

    // -------------------------------------------------
    // AUTO REPEAT ON
    // -------------------------------------------------
    [Fact]
    public async Task SetAutoRepeatAsync_Enable_CreatesRepeat()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Repeats.RemoveRange(ctx.Repeats);
        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "repeat-user",
            Email = "repeat@test.com",
            Fullname = "Repeat User",
            Password = "hashed",
            Role = 2,
            Balance = 500,
            Active = true
        };

        var price = new Boardprice
        {
            Fieldscount = 3,
            Price = 50
        };

        var board = new Board
        {
            Id = "repeat-board",
            Playerid = user.Id,
            Numbers = new List<int> { 1, 2, 3 },
            Times = 2
        };

        ctx.Users.Add(user);
        ctx.Boardprices.Add(price);
        ctx.Boards.Add(board);
        await ctx.SaveChangesAsync();

        var service = new BoardService(ctx);

        var result = await service.SetAutoRepeatAsync(user.Id, board.Id, true);

        Assert.True(result.AutoRepeat);
        Assert.NotNull(result.RepeatId);
    }

    // -------------------------------------------------
    // IS BOARD LOCKED
    // -------------------------------------------------
    [Fact]
    public async Task GetIsBoardLockedAsync_ReturnsOpen_WhenWinningNumbersSet()
    {
        using var ctx = _db.CreateContext();

        ctx.Games.RemoveRange(ctx.Games);
        await ctx.SaveChangesAsync();

        var now = DateTime.UtcNow;
        var week = ISOWeek.GetWeekOfYear(now);
        var year = now.Year;

        ctx.Games.Add(new Game
        {
            Id = "g-open",
            Year = year,
            Weeknumber = week,
            Winningnumbers = new List<int> { 1, 2, 3 }
        });

        await ctx.SaveChangesAsync();

        var service = new BoardService(ctx);

        var result = await service.GetIsBoardLockedAsync();

        Assert.True(result.IsOpen);
        Assert.Null(result.Message);
    }
}
