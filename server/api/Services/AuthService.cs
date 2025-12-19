using System.Security.Claims;
using api.dtos.Requests;
using api.dtos.Responses;
using api.Errors;
using api.security;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AuthService : IAuthService
{
    private readonly MyDbContext _db;

    public AuthService(MyDbContext db)
    {
        _db = db;
    }

    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------
    public async Task<AuthUserInfo> AuthenticateAsync(AuthRequest request)
    {
        ValidateRequest(request);

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);

        if (user == null)
            throw ApiErrors.Unauthorized(
                "Invalid email or password.");

        var passwordValid = PasswordHasher.Verify(
            user.Password,
            request.Password
        );

        if (!passwordValid)
            throw ApiErrors.Unauthorized(
                "Invalid email or password.");

        return new AuthUserInfo(
            user.Id,
            user.Role,
            user.Fullname
        );
    }

    // --------------------------------------------------
    // CURRENT USER INFO
    public async Task<AuthUserInfo?> GetUserInfoAsync(ClaimsPrincipal principal)
    {
        var userId = principal.GetUserId();

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && u.Active);

        if (user == null)
            throw ApiErrors.Unauthorized(
                "Your session is no longer valid. Please log in again.");

        return new AuthUserInfo(
            user.Id,
            user.Role,
            user.Fullname
        );
    }


    // ==================================================
    // VALIDATION
    // ==================================================
    private static void ValidateRequest(AuthRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            throw ApiErrors.BadRequest(
                "Email and password are required.");
        }
    }
}
