using api.Services;
using api.dtos.Requests;
using api.Errors;
using efscaffold.Entities;
using Xunit;

[Collection("Postgres")]
public class AuthServiceTests
{
    private readonly PostgresFixture _db;

    public AuthServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    // ----------------------------
    // HAPPY PATH
    // ----------------------------
    [Fact]
    public async Task AuthenticateAsync_ReturnsUserInfo_WhenCredentialsValid()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "auth-1",
            Email = "auth@test.com",
            Fullname = "Auth User",
            Role = 2,
            Password = api.security.PasswordHasher.Hash("secret"),
            Active = true,
            Balance = 0
        };

        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        var service = new AuthService(ctx);

        var request = new AuthRequest
        {
            Email = "auth@test.com",
            Password = "secret"
        };

        var result = await service.AuthenticateAsync(request);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
        Assert.Equal(2, result.Role);
        Assert.Equal("Auth User", result.FullName);
    }

    // ----------------------------
    // WRONG PASSWORD
    // ----------------------------
    [Fact]
    public async Task AuthenticateAsync_ThrowsUnauthorized_WhenPasswordInvalid()
    {
        using var ctx = _db.CreateContext();

        var user = new User
        {
            Id = "auth-2",
            Email = "wrong@test.com",
            Fullname = "Wrong User",
            Role = 2,
            Password = api.security.PasswordHasher.Hash("correct"),
            Active = true,
            Balance = 0
        };

        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        var service = new AuthService(ctx);

        var request = new AuthRequest
        {
            Email = "wrong@test.com",
            Password = "incorrect"
        };

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            service.AuthenticateAsync(request)
        );

        Assert.Equal(401, ex.StatusCode);
    }
}
