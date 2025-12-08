using System.Security.Claims;
using api.dtos.Requests;
using api.dtos.Responses;
using api.security;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AuthService : IAuthService
{
    private readonly MyDbContext _db;
    private readonly ILogger<AuthService> _logger;

    public AuthService(MyDbContext db, ILogger<AuthService> logger)
    {
        _db     = db;
        _logger = logger;
    }

    public async Task<AuthUserInfo> AuthenticateAsync(AuthRequest request)
    {
        try
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials");

            var passwordValid = api.security.PasswordHasher.Verify(
                user.Password,
                request.Password
            );

            if (!passwordValid)
                throw new UnauthorizedAccessException("Invalid credentials");

            return new AuthUserInfo(user.Id, user.Role, user.Fullname);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authenticating user");
            throw; // will be turned into 401/500 by your exception handler
        }
    }

    public async Task<AuthUserInfo?> GetUserInfoAsync(ClaimsPrincipal principal)
    {
        try
        {
            var userId = principal.GetUserId();

            var user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId && u.Active);

            return user == null ? null : new AuthUserInfo(user.Id, user.Role, user.Fullname);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading user info from claims");
            return null;
        }
    }
}