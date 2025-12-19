using System.Security.Claims;
using api.dtos.Requests;
using api.dtos.Responses;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "PlayerOnly")]
public class RepeatController : ControllerBase
{
    private readonly IRepeatService _repeatService;

    public RepeatController(IRepeatService repeatService)
    {
        _repeatService = repeatService;
    }

    private string GetCurrentPlayerId()
    {
        // Adjust claim type based on your JWT creation
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")
                     ?? User.FindFirstValue("userId");

        if (string.IsNullOrEmpty(userId))
            throw new InvalidOperationException("User id is missing in token.");

        return userId;
    }

    // GET api/repeat/me
    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<RepeatDtoResponse>>> GetMine(CancellationToken ct)
    {
        var playerId = GetCurrentPlayerId();
        var result = await _repeatService.GetByPlayerAsync(playerId, ct);
        return Ok(result);
    }

    // POST api/repeat
    [HttpPost]
    public async Task<ActionResult<RepeatDtoResponse>> Create([FromBody] CreateRepeatRequest request, CancellationToken ct)
    {
        var playerId = GetCurrentPlayerId();
        var created = await _repeatService.CreateAsync(playerId, request, ct);
        return CreatedAtAction(nameof(GetMine), new { id = created.Id }, created);
    }

    // POST api/repeat/{id}/stop
    [HttpPost("{id}/stop")]
    public async Task<IActionResult> Stop(string id, CancellationToken ct)
    {
        var playerId = GetCurrentPlayerId();
        await _repeatService.StopAsync(playerId, id, ct);
        return NoContent();
    }
}
