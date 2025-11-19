using Microsoft.AspNetCore.Mvc;
using api.Dtos.Requests;
using api.Dtos.Responses;
using api.Services;

namespace api.Controllers.Player;

[ApiController]
[Route("api/player/repeats")]
public class MyRepeatsController : ControllerBase
{
    private readonly IRepeatService _service;

    public MyRepeatsController(IRepeatService service)
    {
        _service = service;
    }

    private string GetPlayerId() => Request.Headers["X-PlayerId"]!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RepeatResponse>>> GetMyRepeats()
        => Ok(await _service.GetRepeatsByPlayer(GetPlayerId()));

    [HttpPost]
    public async Task<ActionResult<RepeatResponse>> Create(CreateRepeatDto dto)
    {
        dto.PlayerId = GetPlayerId();
        var repeat = await _service.CreateRepeat(dto);
        return Ok(repeat);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RepeatResponse>> Update(string id, UpdateRepeatDto dto)
    {
        var result = await _service.UpdateRepeat(id, dto);
        return result == null ? NotFound() : Ok(result);
    }
}