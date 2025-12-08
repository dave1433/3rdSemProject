using System.IdentityModel.Tokens.Jwt;
using System.Text;
using api.dtos.Responses;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace api.security;

public interface ITokenService
{
    string CreateToken(AuthUserInfo user);
}

public class JwtService(IConfiguration config) : ITokenService
{
    public const string SignatureAlgorithm = SecurityAlgorithms.HmacSha256;

    public string CreateToken(AuthUserInfo user)
    {
        var secret = config["AppSettings:JwtSecret"];
        if (string.IsNullOrWhiteSpace(secret))
            throw new InvalidOperationException("AppSettings:JwtSecret is not configured");

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SignatureAlgorithm);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject            = new ClaimsIdentity(user.ToClaims()),
            Expires            = DateTime.UtcNow.AddHours(8),
            SigningCredentials = creds,
        };

        var handler = new JwtSecurityTokenHandler();
        var token   = handler.CreateToken(tokenDescriptor);
        return handler.WriteToken(token);
    }

    public static TokenValidationParameters ValidationParameters(IConfiguration config)
    {
        var secret = config["AppSettings:JwtSecret"];
        if (string.IsNullOrWhiteSpace(secret))
            throw new InvalidOperationException("AppSettings:JwtSecret is not configured");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        return new TokenValidationParameters
        {
            IssuerSigningKey       = key,
            ValidAlgorithms        = new[] { SignatureAlgorithm },
            ValidateIssuerSigningKey = true,
            ValidateIssuer         = false,
            ValidateAudience       = false,
            ValidateLifetime       = true,
            ClockSkew              = TimeSpan.Zero,
        };
    }
}