// server/api/Controllers/PlayersController.cs
namespace api.Controllers;

using Microsoft.AspNetCore.Mvc;
using api.Dtos.Requests;
using api.Dtos.Responses;
using api.Services;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _service;

    public PlayersController(IPlayerService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<PlayerResponse>> Create(CreatePlayerDto dto)
    {
        var result = await _service.CreatePlayer(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UpdatePlayerResponse>> Update(string id, UpdatePlayerDto dto)
    {
        var result = await _service.UpdatePlayer(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlayerResponse>> GetById(string id)
    {
        var result = await _service.GetPlayerById(id);
        return result == null ? NotFound() : Ok(result);
    }
}