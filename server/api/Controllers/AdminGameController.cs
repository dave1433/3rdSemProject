using api.dtos.Requests;
using api.dtos.Responses;
using efscaffold;
using efscaffold.Entities;
using Microsoft.AspNetCore.Mvc;

namespace api.controllers;

[ApiController]
[Route("api/admin/games")]
public class AdminGameController : ControllerBase
{
    private readonly MyDbContext _db;

    public AdminGameController(MyDbContext db)
    {
        _db = db;
    }

    [HttpPost("draw")]
    public async Task<ActionResult<GameResponse>> EnterWinningNumbers(
        CreateGameDrawRequest request)
    {
        if (request.WinningNumbers.Count != 3)
            return BadRequest("Exactly 3 winning numbers are required");

        if (request.WinningNumbers.Any(n => n < 1 || n > 16))
            return BadRequest("Numbers must be between 1 and 16");

        var game = new Game
        {
            Id = Guid.NewGuid().ToString(),
            Year = request.Year,
            Weeknumber = request.WeekNumber,
            Winningnumbers = request.WinningNumbers,
            Createdat = DateTime.UtcNow
        };

        _db.Games.Add(game);
        await _db.SaveChangesAsync();

        var response = new GameResponse
        {
            Id = game.Id,
            Year = game.Year,
            WeekNumber = game.Weeknumber,
            WinningNumbers = game.Winningnumbers!,
            CreatedAt = game.Createdat!.Value
        };

        return Ok(response);
    }
}