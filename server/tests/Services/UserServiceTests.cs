using api.Services;
using api.dtos.Requests;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace tests.Services;

public class UserServiceTests
{
    private readonly IUserService _service;
    private readonly MyDbContext _db;

    public UserServiceTests(IUserService service, MyDbContext db)
    {
        _service = service;
        _db = db;

        // Ensure schema exists
        _db.Database.Migrate();
    }

    // -------------------------------
    // CREATE USER
    // -------------------------------

    [Fact]
    public async Task CreateUserAsync_Should_Create_User_When_Valid()
    {
        var req = new CreateUserRequest
        {
            Email = "user@test.com",
            Password = "123456",
            FullName = "Test User",
            Role = "player"
        };

        var result = await _service.CreateUserAsync(req);

        result.Should().NotBeNull();
        result.Email.Should().Be("user@test.com");

        _db.Users.Count().Should().Be(1);
    }

    [Fact]
    public async Task CreateUserAsync_Should_Throw_When_Email_Missing()
    {
        var req = new CreateUserRequest
        {
            Email = "",
            Password = "123"
        };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            _service.CreateUserAsync(req));
    }

    [Fact]
    public async Task CreateUserAsync_Should_Throw_When_Email_Already_Exists()
    {
        await _service.CreateUserAsync(new CreateUserRequest
        {
            Email = "dup@test.com",
            Password = "123"
        });

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.CreateUserAsync(new CreateUserRequest
            {
                Email = "dup@test.com",
                Password = "123"
            }));
    }

    // -------------------------------
    // GET BY ID
    // -------------------------------

    [Fact]
    public async Task GetByIdAsync_Should_Return_User_When_Exists()
    {
        var created = await _service.CreateUserAsync(new CreateUserRequest
        {
            Email = "find@test.com",
            Password = "123"
        });

        var result = await _service.GetByIdAsync(created.Id);

        result.Should().NotBeNull();
        result!.Email.Should().Be("find@test.com");
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_Null_When_NotFound()
    {
        var result = await _service.GetByIdAsync("no-such-id");
        result.Should().BeNull();
    }

    // -------------------------------
    // ACTIVATE / DEACTIVATE
    // -------------------------------

    [Fact]
    public async Task ActivateAsync_Should_Activate_User()
    {
        var user = await _service.CreateUserAsync(new CreateUserRequest
        {
            Email = "active@test.com",
            Password = "123"
        });

        var success = await _service.ActivateAsync(user.Id);

        success.Should().BeTrue();
        _db.Users.Single().Active.Should().BeTrue();
    }

    [Fact]
    public async Task DeactivateAsync_Should_Return_False_When_User_NotFound()
    {
        var result = await _service.DeactivateAsync("missing");
        result.Should().BeFalse();
    }

    // -------------------------------
    // GET CURRENT USER
    // -------------------------------

    [Fact]
    public async Task GetCurrentAsync_Should_Return_User_From_Claims()
    {
        var user = await _service.CreateUserAsync(new CreateUserRequest
        {
            Email = "me@test.com",
            Password = "123"
        });

        // Insert approved transaction to test balance
        _db.Transactions.Add(new Transaction
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = user.Id,
            Amount = 100,
            Status = "approved"
        });

        await _db.SaveChangesAsync();

        var claims = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            })
        );

        var result = await _service.GetCurrentAsync(claims);

        result.Should().NotBeNull();
        result!.Balance.Should().Be(100);
    }
}
