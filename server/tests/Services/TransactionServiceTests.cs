using api.Services;
using api.dtos.Requests;
using efscaffold.Entities;
using Xunit;

[Collection("Postgres")]
public class TransactionServiceTests
{
    private readonly PostgresFixture _db;

    public TransactionServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    [Fact]
    public async Task CreateDepositAsync_CreatesPendingTransaction()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "user-1",
            Email = "test@test.com",
            Fullname = "Test User",
            Password = "hashed-password", //  REQUIRED
            Role = 2,              //  usually NOT NULL
            Balance = 0
        };

        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        var service = new TransactionService(ctx);

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
}