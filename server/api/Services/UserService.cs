using System.Security.Claims;
using api.dtos.Requests;
using api.dtos.Responses;
using api.Errors;
using api.security;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class UserService : IUserService
{
    private readonly MyDbContext _db;

    public UserService(MyDbContext db)
    {
        _db = db;
    }

    // -------------------------------
    // CREATE USER
    // -------------------------------
    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw ApiErrors.BadRequest(
                "Email is required.");

        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw ApiErrors.Conflict(
                "An account with this email already exists.");

        var user = new User
        {
            Id        = Guid.NewGuid().ToString(),
            Email     = request.Email,
            Password  = PasswordHasher.Hash(request.Password),
            Fullname  = request.FullName,
            Phone     = request.Phone,
            Role      = request.Role,
            Active    = false,
            Balance   = 0,
            Createdat = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return ToResponse(user);
    }

    // -------------------------------
    // GET ALL USERS (Alphabetical)
    // -------------------------------
    public async Task<List<UserResponse>> GetAllUsersAsync()
    {
        var users = await _db.Users
            .OrderBy(u => u.Fullname.ToLower())
            .ToListAsync();

        return users.Select(ToResponse).ToList();
    }

    // -------------------------------
    // GET BY ID
    // -------------------------------
    public async Task<UserResponse?> GetByIdAsync(string id)
    {
        var user = await _db.Users.FindAsync(id);
        return user == null ? null : ToResponse(user);
    }

    // -------------------------------
    // GET CURRENT USER FROM JWT
    // -------------------------------
    public async Task<UserResponse?> GetCurrentAsync(ClaimsPrincipal user)
    {
        var userId = user.GetUserId();

        var entity = await _db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == userId);

        if (entity == null)
            return null;

        // Balance = sum of APPROVED transactions
        var balance = await _db.Transactions
            .AsNoTracking()
            .Where(t => t.Playerid == userId && t.Status == "approved")
            .Select(t => (int?)t.Amount)
            .SumAsync() ?? 0;

        return new UserResponse
        {
            Id        = entity.Id,
            FullName  = entity.Fullname ?? "",
            Phone     = entity.Phone ?? "",
            Email     = entity.Email,
            Active    = entity.Active,
            Balance   = balance,
            Role      = entity.Role,
            CreatedAt = entity.Createdat
        };
    }

    // -------------------------------
    // ACTIVATE
    // -------------------------------
    public async Task<bool> ActivateAsync(string id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return false;

        user.Active = true;
        await _db.SaveChangesAsync();
        return true;
    }

    // -------------------------------
    // DEACTIVATE
    // -------------------------------
    public async Task<bool> DeactivateAsync(string id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return false;

        user.Active = false;
        await _db.SaveChangesAsync();
        return true;
    }

    // -------------------------------
    // Helper: Convert Entity → DTO
    // -------------------------------
    private static UserResponse ToResponse(User u)
    {
        return new UserResponse
        {
            Id        = u.Id,
            FullName  = u.Fullname ?? "",
            Phone     = u.Phone ?? "",
            Email     = u.Email,
            Active    = u.Active,
            Balance   = u.Balance,
            Role      = u.Role,
            CreatedAt = u.Createdat
        };
    }
}
