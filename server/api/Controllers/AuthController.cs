using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Infrastructure.Postgres.Scaffolding;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly MyDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(MyDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public record LoginRequest(string Email, string Password);
        public record LoginResponse(string Token, int Role, string UserId);

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);

            if (user == null)
                return Unauthorized("Invalid credentials");

            bool passwordValid = api.security.PasswordHasher.Verify(
                user.Password,
                request.Password
            );

            if (!passwordValid)
                return Unauthorized("Invalid credentials");

            // Generate JWT
            var secret = _config["AppSettings:JwtSecret"]!;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim("role", user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return Ok(new LoginResponse(
                new JwtSecurityTokenHandler().WriteToken(token),
                user.Role,
                user.Id
            ));
        }
    }
}
