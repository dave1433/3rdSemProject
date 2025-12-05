using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using efscaffold;
using efscaffold.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using api.security;  
using Infrastructure.Postgres.Scaffolding; 


namespace api.dtos
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

        // -----------------------------
        // POST /api/player
        // -----------------------------

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
                Active = true,
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
                Active = user.Active,
                Balance = user.Balance
            });
        }

        // -----------------------------
        // GET /api/player
        // -----------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUser()
        {
            var users = await _db.Users
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    FullName = u.Fullname ?? "",
                    Phone = u.Phone ?? "",
                    Active = u.Active,
                    Balance = u.Balance
                })
                .ToListAsync();

            return Ok(users);
        }

    }
}
