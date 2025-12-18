using api.Services;
using api.dtos.Requests;
using api.Errors;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Sieve.Models;
using tests.Fixtures;
using Xunit;

[Collection("Postgres")]
public class TransactionServiceTests
{
    private readonly PostgresFixture _db;

    public TransactionServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    private TransactionService CreateService(MyDbContext ctx)
        => new(ctx, SieveTestFactory.Create());

    // ---------------------------------
    // CREATE DEPOSIT
    // ---------------------------------
    [Fact]
    public async Task CreateDepositAsync_CreatesPendingTransaction()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "user-1",
            Email = "test@test.com",
            Fullname = "Test User",
            Password = "hashed-password",
            Role = 2,
            Balance = 0,
            Active = true
        };

        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        var request = new CreateTransactionRequest
        {
            UserId = user.Id,
            Amount = 100,
            MobilePayRef = "MP123"
        };

        var result = await service.CreateDepositAsync(request);

        Assert.NotNull(result);
        Assert.Equal("pending", result.Status);
        Assert.Equal(100, result.Amount);

        var tx = ctx.Transactions.Single();
        Assert.Equal("deposit", tx.Type);
        Assert.Equal("pending", tx.Status);
        Assert.Equal(user.Id, tx.Playerid);
    }

    // ---------------------------------
    // CREATE DEPOSIT - USER NOT FOUND
    // ---------------------------------
    [Fact]
    public async Task CreateDepositAsync_ThrowsNotFound_WhenUserMissing()
    {
        using var ctx = _db.CreateContext();

        var service = CreateService(ctx);

        var request = new CreateTransactionRequest
        {
            UserId = "missing-user",
            Amount = 100,
            MobilePayRef = "MP404"
        };

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            service.CreateDepositAsync(request)
        );

        Assert.Equal(404, ex.StatusCode);
    }

    // ---------------------------------
    // UPDATE STATUS - APPROVED
    // ---------------------------------
    [Fact]
    public async Task UpdateStatusAsync_Approved_IncreasesUserBalance()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "user-2",
            Email = "balance@test.com",
            Fullname = "Balance User",
            Password = "hashed",
            Role = 2,
            Balance = 50,
            Active = true
        };

        var admin = new User
        {
            Id = "admin-1",
            Email = "admin@test.com",
            Fullname = "Admin User",
            Password = "hashed",
            Role = 1,
            Balance = 0,
            Active = true
        };

        var tx = new Transaction
        {
            Id = "tx-1",
            Playerid = user.Id,
            Type = "deposit",
            Amount = 200,
            Status = "pending",
            Createdat = DateTime.UtcNow
        };

        ctx.Users.AddRange(user, admin);
        ctx.Transactions.Add(tx);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        var result = await service.UpdateStatusAsync(
            tx.Id,
            new UpdateTransactionStatusRequest { Status = "approved" },
            admin.Id
        );

        Assert.Equal("approved", result.Status);
        Assert.Equal(250, ctx.Users.Single(u => u.Id == user.Id).Balance);
    }

    // ---------------------------------
    // UPDATE STATUS - REJECTED
    // ---------------------------------
    [Fact]
    public async Task UpdateStatusAsync_Rejected_DoesNotChangeBalance()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "user-3",
            Email = "reject@test.com",
            Fullname = "Reject User",
            Password = "hashed",
            Role = 2,
            Balance = 100,
            Active = true
        };

        var admin = new User
        {
            Id = "admin-2",
            Email = "admin2@test.com",
            Fullname = "Admin Two",
            Password = "hashed",
            Role = 1,
            Balance = 0,
            Active = true
        };

        var tx = new Transaction
        {
            Id = "tx-2",
            Playerid = user.Id,
            Type = "deposit",
            Amount = 300,
            Status = "pending",
            Createdat = DateTime.UtcNow
        };

        ctx.Users.AddRange(user, admin);
        ctx.Transactions.Add(tx);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        var result = await service.UpdateStatusAsync(
            tx.Id,
            new UpdateTransactionStatusRequest { Status = "rejected" },
            admin.Id
        );

        Assert.Equal("rejected", result.Status);
        Assert.Equal(100, ctx.Users.Single(u => u.Id == user.Id).Balance);
    }

    // ---------------------------------
    // UPDATE STATUS - INVALID STATUS
    // ---------------------------------
    [Fact]
    public async Task UpdateStatusAsync_ThrowsBadRequest_WhenStatusInvalid()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "user-4",
            Email = "invalid@test.com",
            Fullname = "Invalid User",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        var tx = new Transaction
        {
            Id = "tx-3",
            Playerid = user.Id,
            Type = "deposit",
            Amount = 10,
            Status = "pending",
            Createdat = DateTime.UtcNow
        };

        ctx.Users.Add(user);
        ctx.Transactions.Add(tx);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            service.UpdateStatusAsync(
                tx.Id,
                new UpdateTransactionStatusRequest { Status = "lol" },
                "admin"
            )
        );

        Assert.Equal(400, ex.StatusCode);
    }

    // ---------------------------------
    // GET BY USER
    // ---------------------------------
    [Fact]
    public async Task GetByUserAsync_ReturnsNewestFirst()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "user-5",
            Email = "history@test.com",
            Fullname = "History User",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        ctx.Users.Add(user);

        ctx.Transactions.AddRange(
            new Transaction
            {
                Id = "t1",
                Playerid = user.Id,
                Type = "deposit",
                Amount = 10,
                Status = "pending",
                Createdat = DateTime.UtcNow.AddDays(-1)
            },
            new Transaction
            {
                Id = "t2",
                Playerid = user.Id,
                Type = "deposit",
                Amount = 20,
                Status = "pending",
                Createdat = DateTime.UtcNow
            }
        );

        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        var list = await service.GetByUserAsync(user.Id, new SieveModel());

        Assert.Equal(2, list.Count);
        Assert.Equal("t2", list[0].Id);
    }

    // ---------------------------------
    // GET PENDING (ADMIN)
    // ---------------------------------
    [Fact]
    public async Task GetPendingAsync_ReturnsOnlyPending()
    {
        using var ctx = _db.CreateContext();

        ctx.Users.RemoveRange(ctx.Users);
        ctx.Transactions.RemoveRange(ctx.Transactions);
        await ctx.SaveChangesAsync();

        var user = new User
        {
            Id = "user-6",
            Email = "pending@test.com",
            Fullname = "Admin Test",
            Password = "hashed",
            Role = 2,
            Balance = 0,
            Active = true
        };

        ctx.Users.Add(user);

        ctx.Transactions.AddRange(
            new Transaction
            {
                Id = "p1",
                Playerid = user.Id,
                Type = "deposit",
                Amount = 50,
                Status = "pending",
                Createdat = DateTime.UtcNow
            },
            new Transaction
            {
                Id = "a1",
                Playerid = user.Id,
                Type = "deposit",
                Amount = 60,
                Status = "approved",
                Createdat = DateTime.UtcNow
            }
        );

        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        var list = await service.GetPendingAsync(new SieveModel());

        Assert.Single(list);
        Assert.Equal("pending", list[0].Status);
    }
}
