using api.Services;
using api.dtos.Requests;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.Extensions.Logging.Abstractions;
using System.Security.Claims;
using Xunit;

[Collection("Postgres")]
public class UserServiceTests
{
    private readonly PostgresFixture _db;

    public UserServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    private UserService CreateService(MyDbContext ctx)
        => new(ctx, NullLogger<UserService>.Instance);

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    private static async Task CleanDatabaseAsync(MyDbContext ctx)
    {
        ctx.Transactions.RemoveRange(ctx.Transactions);
        ctx.Users.RemoveRange(ctx.Users);
        await ctx.SaveChangesAsync();
    }

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------

    [Fact]
    public async Task CreateUserAsync_CreatesUser()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);

        var request = new CreateUserRequest
        {
            FullName = "John Doe",
            Phone = "12345678",
            Email = $"{Guid.NewGuid()}@test.com",
            Password = "secret",
            Role = 1
        };

        var result = await service.CreateUserAsync(request);

        Assert.NotNull(result);
        Assert.Equal("John Doe", result.FullName);
        Assert.False(result.Active);
    }

    [Fact]
    public async Task CreateUserAsync_Throws_WhenEmailExists()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);
        var email = $"{Guid.NewGuid()}@test.com";

        await service.CreateUserAsync(new CreateUserRequest
        {
            FullName = "Jane",
            Email = email,
            Password = "pw",
            Role = 1
        });

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateUserAsync(new CreateUserRequest
            {
                FullName = "Jane2",
                Email = email,
                Password = "pw",
                Role = 1
            }));
    }

    // --------------------------------------------------
    // GET ALL USERS
    // --------------------------------------------------

    [Fact]
    public async Task GetAllUsersAsync_ReturnsAlphabetical()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);

        ctx.Users.AddRange(
            new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = "b@test.com",
                Password = "x",
                Fullname = "Bob",
                Createdat = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = "a@test.com",
                Password = "x",
                Fullname = "Alice",
                Createdat = DateTime.UtcNow
            }
        );

        await ctx.SaveChangesAsync();

        var users = await service.GetAllUsersAsync();

        Assert.Equal(2, users.Count);
        Assert.Equal("Alice", users[0].FullName);
        Assert.Equal("Bob", users[1].FullName);
    }

    // --------------------------------------------------
    // GET BY ID
    // --------------------------------------------------

    [Fact]
    public async Task GetByIdAsync_ReturnsUser_WhenExists()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);
        var userId = Guid.NewGuid().ToString();

        ctx.Users.Add(new User
        {
            Id = userId,
            Email = "u@test.com",
            Password = "x",
            Fullname = "User",
            Createdat = DateTime.UtcNow
        });

        await ctx.SaveChangesAsync();

        var result = await service.GetByIdAsync(userId);

        Assert.NotNull(result);
        Assert.Equal("User", result!.FullName);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenMissing()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);

        var result = await service.GetByIdAsync(Guid.NewGuid().ToString());

        Assert.Null(result);
    }

    // --------------------------------------------------
    // GET CURRENT USER
    // --------------------------------------------------

    [Fact]
    public async Task GetCurrentAsync_ReturnsUser_WithApprovedBalance()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);
        var userId = Guid.NewGuid().ToString();

        ctx.Users.Add(new User
        {
            Id = userId,
            Email = "me@test.com",
            Password = "x",
            Fullname = "Me",
            Createdat = DateTime.UtcNow
        });

        ctx.Transactions.AddRange(
            new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = userId,
                Type = "deposit",
                Amount = 100,
                Status = "approved",
                Createdat = DateTime.UtcNow
            },
            new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = userId,
                Type = "deposit",
                Amount = 50,
                Status = "pending",
                Createdat = DateTime.UtcNow
            },
            new Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Playerid = userId,
                Type = "deposit",
                Amount = 25,
                Status = "approved",
                Createdat = DateTime.UtcNow
            }
        );

        await ctx.SaveChangesAsync();

        var principal = new ClaimsPrincipal(
            new ClaimsIdentity(new[] { new Claim("sub", userId) }, "jwt"));

        var result = await service.GetCurrentAsync(principal);

        Assert.NotNull(result);
        Assert.Equal(125, result!.Balance);
    }

    // --------------------------------------------------
    // ACTIVATE / DEACTIVATE
    // --------------------------------------------------

    [Fact]
    public async Task ActivateAsync_ActivatesUser()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);
        var userId = Guid.NewGuid().ToString();

        ctx.Users.Add(new User
        {
            Id = userId,
            Email = $"{Guid.NewGuid()}@test.com",
            Password = "x",
            Fullname = "A",
            Active = false,
            Createdat = DateTime.UtcNow
        });

        await ctx.SaveChangesAsync();

        var result = await service.ActivateAsync(userId);

        Assert.True(result);
        Assert.True(ctx.Users.Single(u => u.Id == userId).Active);
    }

    [Fact]
    public async Task DeactivateAsync_ReturnsFalse_WhenMissing()
    {
        using var ctx = _db.CreateContext();
        await CleanDatabaseAsync(ctx);

        var service = CreateService(ctx);

        var result = await service.DeactivateAsync(Guid.NewGuid().ToString());

        Assert.False(result);
    }
}
