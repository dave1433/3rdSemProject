using Microsoft.AspNetCore.Mvc;
using api.Services;
using api.Dtos.Requests;
using api.Dtos.Responses;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameService _service;

    public GamesController(IGameService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameResponse>>> GetAll()
    {
        return Ok(await _service.GetAll());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameResponse>> GetById(string id)
    {
        var game = await _service.GetById(id);
        return game == null ? NotFound() : Ok(game);
    }

    [HttpPost]
    public async Task<ActionResult<GameResponse>> Create(CreateGameDto dto)
    {
        var game = await _service.Create(dto);
        return CreatedAtAction(nameof(GetById), new { id = game.Id }, game);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GameResponse>> Update(string id, UpdateGameDto dto)
    {
        var updated = await _service.Update(id, dto);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var ok = await _service.Delete(id);
        return ok ? NoContent() : NotFound();
    }
}