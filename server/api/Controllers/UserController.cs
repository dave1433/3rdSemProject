using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using efscaffold.Entities;
using api.security;
using Infrastructure.Postgres.Scaffolding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly MyDbContext _db;

        public UserController(MyDbContext db)
        {
            _db = db;
        }

        // ------------------------------------------------------------
        // CREATE USER (POST /api/user)
        // ------------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
        {
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                Password = PasswordHasher.Hash(request.Password),
                Role = request.Role,
                Fullname = request.FullName,
                Phone = request.Phone,

                Active = false,
                Balance = 0,
                Createdat = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new UserResponse
            {
                Id = user.Id,
                FullName = user.Fullname ?? "",
                Phone = user.Phone ?? "",
                Email = user.Email,
                Active = user.Active,
                Balance = user.Balance,
                Role = user.Role
            });
        }

        // ------------------------------------------------------------
        // GET ALL USERS (GET /api/user)
        // ------------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
        {
            var users = await _db.Users
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    FullName = u.Fullname ?? "",
                    Phone = u.Phone ?? "",
                    Email = u.Email,
                    Active = u.Active,
                    Balance = u.Balance,
                    Role = u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        // ------------------------------------------------------------
        // GET CURRENT LOGGED-IN USER (GET /api/user/me)
        // ------------------------------------------------------------
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserResponse>> GetCurrentUser()
        {
            // Retrieve ID from JWT token
            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("id")?.Value;

            if (userId == null)
                return Unauthorized("User ID missing in token");

            var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                return NotFound("User not found");

            return Ok(new UserResponse
            {
                Id = user.Id,
                FullName = user.Fullname ?? "",
                Phone = user.Phone ?? "",
                Email = user.Email,
                Active = user.Active,
                Balance = user.Balance,
                Role = user.Role
            });
        }

        // ------------------------------------------------------------
        // ACTIVATE USER (PATCH /api/user/{id}/activate)
        // ------------------------------------------------------------
        [HttpPatch("{id}/activate")]
        public async Task<ActionResult> ActivateUser(string id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");

            user.Active = true;
            await _db.SaveChangesAsync();

            return Ok(new { message = "User activated" });
        }

        // ------------------------------------------------------------
        // DEACTIVATE USER (PATCH /api/user/{id}/deactivate)
        // ------------------------------------------------------------
        [HttpPatch("{id}/deactivate")]
        public async Task<ActionResult> DeactivateUser(string id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");

            user.Active = false;
            await _db.SaveChangesAsync();

            return Ok(new { message = "User deactivated" });
        }
    }
}
