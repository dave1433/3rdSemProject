using api.dtos.Requests;
using api.dtos.Responses;
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

    // --------------------------------------------------
    // ENTER WINNING NUMBERS
    // --------------------------------------------------
    [HttpPost("draw")]
    public async Task<ActionResult<GameResponse>> EnterWinningNumbers(
        [FromBody] CreateGameDrawRequest request)
    {
        try
        {
            var result = await _admin.EnterWinningNumbersAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    // --------------------------------------------------
    // CHECK IF WEEK IS LOCKED
    // --------------------------------------------------
    [HttpGet("draw/status")]
    public async Task<ActionResult<bool>> IsWeekLocked(
        int year,
        int weekNumber)
    {
        return Ok(await _admin.IsWeekLockedAsync(year, weekNumber));
    }

    // --------------------------------------------------
    // WEEKLY WINNER SUMMARY
    // --------------------------------------------------
    [HttpGet("winners/summary")]
    public async Task<ActionResult<List<WeeklyBoardSummaryDto>>> GetWeeklyWinningSummary()
    {
        return Ok(await _admin.GetWeeklyWinningSummaryAsync());
    }

    // --------------------------------------------------
    // DRAW HISTORY
    // --------------------------------------------------
    [HttpGet("draw/history")]
    public async Task<ActionResult<List<GameHistoryResponse>>> GetDrawHistory()
    {
        return Ok(await _admin.GetDrawHistoryAsync());
    }
}
