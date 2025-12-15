using api.Services;
using api.dtos.Requests;
using efscaffold.Entities;
using Xunit;

[Collection("Postgres")]
public class RepeatServiceTests
{
    private readonly PostgresFixture _db;

    public RepeatServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    // --------------------------------------------------
    // CREATE REPEAT
    // --------------------------------------------------
    [Fact]
    public async Task CreateAsync_CreatesRepeatAndFirstBoard()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Games.RemoveRange(ctx.Games);
        ctx.Repeats.RemoveRange(ctx.Repeats);
        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        ctx.Transactions.RemoveRange(ctx.Transactions);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "player-1",
            Email = "repeat@test.com",
            Fullname = "Repeat Player",
            Password = "hashed",
            Role = 2,
            Balance = 500,
            Active = true
        };

        var game = new Game
        {
            Id = "game-1",
            Year = 2025,
            Weeknumber = 1,
            Createdat = DateTime.UtcNow.AddMinutes(-10),
            Winningnumbers = new List<int> { 1, 2, 3 }
        };

        ctx.Users.Add(user);
        ctx.Games.Add(game);
        ctx.Boardprices.Add(new Boardprice
        {
            Fieldscount = 5,
            Price = 20
        });

        await ctx.SaveChangesAsync();

        var service = new RepeatService(ctx);

        var request = new CreateRepeatRequest
        {
            Numbers = new List<int> { 1, 2, 3, 4, 5 },
            Times = 2,
            Weeks = 3
        };

        var result = await service.CreateAsync(user.Id, request);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.PlayerId);
        Assert.Equal(2, result.RemainingWeeks);
        Assert.Equal("Active", result.Status);

        Assert.Single(ctx.Repeats);
        Assert.Single(ctx.Boards);
        Assert.Single(ctx.Transactions);
    }

    // --------------------------------------------------
    // GET BY PLAYER
    // --------------------------------------------------
    [Fact]
    public async Task GetByPlayerAsync_ReturnsRepeatsForUser()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Repeats.RemoveRange(ctx.Repeats);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "p1",
            Email = "repeat-user@test.com",
            Fullname = "Repeat User",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        ctx.Users.Add(user);

        ctx.Repeats.Add(new Repeat
        {
            Id = "r1",
            Playerid = user.Id,
            Numbers = new List<int> { 1, 2, 3, 4, 5 },
            Price = 100,
            Remainingweeks = 1,
            Optout = false,
            Createdat = DateTime.UtcNow
        });

        await ctx.SaveChangesAsync();

        var service = new RepeatService(ctx);

        var result = await service.GetByPlayerAsync(user.Id);

        Assert.Single(result);
        Assert.Equal("r1", result[0].Id);
    }

    // --------------------------------------------------
    // STOP REPEAT
    // --------------------------------------------------
    [Fact] 
    public async Task StopAsync_SetsOptOutAndRemainingWeeksZero()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Repeats.RemoveRange(ctx.Repeats);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "p-stop",
            Email = "stop@test.com",
            Fullname = "Stop User",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        var repeat = new Repeat
        {
            Id = "stop-1",
            Playerid = user.Id,
            Numbers = new List<int> { 1, 2, 3, 4, 5 },
            Price = 50,
            Remainingweeks = 5,
            Optout = false,
            Createdat = DateTime.UtcNow
        };

        ctx.Users.Add(user);
        ctx.Repeats.Add(repeat);
        await ctx.SaveChangesAsync();

        var service = new RepeatService(ctx);

        await service.StopAsync(user.Id, repeat.Id);

        var updated = ctx.Repeats.Single(r => r.Id == repeat.Id);
        Assert.True(updated.Optout);
        Assert.Equal(0, updated.Remainingweeks);
    }


    // --------------------------------------------------
    // GENERATE BOARDS FOR GAME (SUCCESS)
    // --------------------------------------------------
    [Fact]
    public async Task GenerateBoardsForGameAsync_CreatesBoardAndDeductsBalance()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Games.RemoveRange(ctx.Games);
        ctx.Repeats.RemoveRange(ctx.Repeats);
        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Transactions.RemoveRange(ctx.Transactions);
        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "repeat-player",
            Email = "repeat2@test.com",
            Fullname = "Repeat Player",
            Password = "hashed",
            Role = 2,
            Balance = 200,
            Active = true
        };

        var repeat = new Repeat
        {
            Id = "repeat-1",
            Playerid = user.Id,
            Numbers = new List<int> { 1, 2, 3, 4, 5 },
            Price = 100,
            Remainingweeks = 1,
            Optout = false,
            Createdat = DateTime.UtcNow.AddMinutes(-10)
        };

        var game = new Game
        {
            Id = "game-r",
            Year = 2025,
            Weeknumber = 2,
            Createdat = DateTime.UtcNow,
            Winningnumbers = new List<int> { 1, 2, 3 }
        };

        ctx.Users.Add(user);
        ctx.Repeats.Add(repeat);
        ctx.Games.Add(game);
        ctx.Boardprices.Add(new Boardprice
        {
            Fieldscount = 5,
            Price = 100
        });

        await ctx.SaveChangesAsync();

        var service = new RepeatService(ctx);

        await service.GenerateBoardsForGameAsync(game.Id);

        Assert.Single(ctx.Boards);
        Assert.Single(ctx.Transactions);

        var updatedUser = ctx.Users.Single();
        Assert.Equal(100, updatedUser.Balance);
    }

    // --------------------------------------------------
    // GENERATE BOARDS FOR GAME (INSUFFICIENT BALANCE)
    // --------------------------------------------------
    [Fact]
    public async Task GenerateBoardsForGameAsync_StopsRepeat_WhenBalanceInsufficient()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Games.RemoveRange(ctx.Games);
        ctx.Repeats.RemoveRange(ctx.Repeats);
        ctx.Boards.RemoveRange(ctx.Boards);
        ctx.Transactions.RemoveRange(ctx.Transactions);
        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "poor-player",
            Email = "poor@test.com",
            Fullname = "Poor Player",
            Password = "hashed",
            Role = 2,
            Balance = 10,
            Active = true
        };

        var repeat = new Repeat
        {
            Id = "repeat-poor",
            Playerid = user.Id,
            Numbers = new List<int> { 1, 2, 3, 4, 5 },
            Price = 100,
            Remainingweeks = 2,
            Optout = false,
            Createdat = DateTime.UtcNow.AddMinutes(-10)
        };

        var game = new Game
        {
            Id = "game-poor",
            Year = 2025,
            Weeknumber = 3,
            Createdat = DateTime.UtcNow,
            Winningnumbers = new List<int> { 1, 2, 3 }
        };

        ctx.Users.Add(user);
        ctx.Repeats.Add(repeat);
        ctx.Games.Add(game);
        ctx.Boardprices.Add(new Boardprice
        {
            Fieldscount = 5,
            Price = 100
        });

        await ctx.SaveChangesAsync();

        var service = new RepeatService(ctx);

        await service.GenerateBoardsForGameAsync(game.Id);

        var updatedRepeat = ctx.Repeats.Single();
        Assert.True(updatedRepeat.Optout);
        Assert.Equal(0, updatedRepeat.Remainingweeks);
        Assert.Empty(ctx.Boards);
    }
}
