using api.dtos.Responses;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/games")]
[Authorize] // allow Admin + Player
public class GameResultController : ControllerBase
{
    private readonly MyDbContext _db;

    public GameResultController(MyDbContext db)
    {
        _db = db;
    }

    // GET /api/games/draw/history
    [HttpGet("draw/history")]
    public async Task<ActionResult<List<GameHistoryResponse>>> GetDrawHistoryForPlayers()
    {
        var history = await _db.Games
            .AsNoTracking()
            .Where(g => g.Winningnumbers != null && g.Winningnumbers.Count > 0)
            .OrderByDescending(g => g.Year)
            .ThenByDescending(g => g.Weeknumber)
            .Select(g => new GameHistoryResponse
            {
                Id = g.Id,
                Year = g.Year,
                WeekNumber = g.Weeknumber,
                WinningNumbers = g.Winningnumbers!,
                CreatedAt = g.Createdat!.Value
            })
            .ToListAsync();

        return Ok(history);
    }
}