using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Postgres.Scaffolding;   // <-- Your actual DbContext namespace
using efscaffold.Entities;                   // <-- Your scaffolded Player entity
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace api.dtos   // <-- Keep your folder structure, or adjust your namespace
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
        public class CreatePlayerRequest
        {
            public string FullName { get; set; } = default!;
            public string Phone { get; set; } = default!;
            public string Email { get; set; } = default!;
            public string Password { get; set; } = default!;
        }

        public class PlayerResponse
        {
            public string Id { get; set; } = default!;
            public string FullName { get; set; } = default!;
            public string Phone { get; set; } = default!;
            public bool Active { get; set; }
            public int Balance { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<PlayerResponse>> CreatePlayer(CreatePlayerRequest request)
        {
            var player = new Player
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                Password = request.Password, // TODO: hash later
                Fullname = request.FullName,
                Phone = request.Phone,
                Active = true,
                Balance = 0,
                Createdat = DateTime.UtcNow
            };

            _db.Players.Add(player);
            await _db.SaveChangesAsync();

            return Ok(new PlayerResponse
            {
                Id = player.Id,
                FullName = player.Fullname,
                Phone = player.Phone ?? "",
                Active = player.Active,
                Balance = player.Balance
            });
        }

        // -----------------------------
        // GET /api/player
        // -----------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlayerResponse>>> GetPlayers()
        {
            var players = await _db.Players
                .Select(p => new PlayerResponse
                {
                    Id = p.Id,
                    FullName = p.Fullname,
                    Phone = p.Phone ?? "",
                    Active = p.Active,
                    Balance = p.Balance
                })
                .ToListAsync();

            return Ok(players);
        }
    }
}
