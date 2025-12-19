using System.Security.Claims;
using api.dtos.Responses;

namespace api.security;

public static class ClaimExtensions
{
    // Used by GetUserInfoAsync() and anywhere userId is needed
    public static string GetUserId(this ClaimsPrincipal claims) =>
        claims.FindFirst("sub")?.Value
        ?? claims.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? throw new InvalidOperationException("No user id claim found");

    // Extract role claim from JWT
    public static int GetRole(this ClaimsPrincipal claims)
    {
        var value = claims.FindFirst("role")?.Value;
        return int.TryParse(value, out var role) ? role : 0;
    }

    // Claims added to JWT on login
    public static IEnumerable<Claim> ToClaims(this AuthUserInfo user) =>
        new[]
        {
            new Claim("sub",  user.Id),
            new Claim("role", user.Role.ToString())
        };

    public static ClaimsPrincipal ToPrincipal(this AuthUserInfo user) =>
        new ClaimsPrincipal(
            new ClaimsIdentity(user.ToClaims(), "jwt"));
}