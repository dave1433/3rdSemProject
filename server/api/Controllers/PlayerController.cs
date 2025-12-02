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
    public class PlayerController : ControllerBase
    {
        private readonly MyDbContext _db;

        public PlayerController(MyDbContext db)
        {
            _db = db;
        }

        // -----------------------------
        // POST /api/player
        // -----------------------------

        [HttpPost]
        public async Task<ActionResult<PlayerResponse>> CreatePlayer(CreatePlayerRequest request)
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

            return Ok(new PlayerResponse
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
        public async Task<ActionResult<IEnumerable<PlayerResponse>>> GetPlayers()
        {
            var users = await _db.Users
                .Select(u => new PlayerResponse
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
