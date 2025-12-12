using api.dtos.Requests;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/admin/games")]
[Authorize(Policy = "AdminOnly")]
public class AdminGameController : ControllerBase
{
    private readonly IAdminGameService _admin;

    public AdminGameController(IAdminGameService admin)
    {
        _admin = admin;
    }

    [HttpPost("draw")]
    public async Task<ActionResult> Draw(CreateGameDrawRequest req)
        => Ok(await _admin.EnterWinningNumbersAsync(req));

    [HttpGet("draw/status")]
    public async Task<ActionResult<bool>> Status(int year, int weekNumber)
        => Ok(await _admin.IsWeekLockedAsync(year, weekNumber));

    [HttpGet("winners/summary")]
    public async Task<ActionResult> Summary()
        => Ok(await _admin.GetWeeklyWinningSummaryAsync());

    [HttpGet("draw/history")]
	public async Task<ActionResult> History()
	{
    Console.WriteLine("=== ADMIN CALL CLAIMS ===");
    foreach (var c in User.Claims)
        Console.WriteLine($"{c.Type}: {c.Value}");

    return Ok(await _admin.GetDrawHistoryAsync());
}
}


