using Microsoft.AspNetCore.Mvc;
using api.Dtos.Requests;
using api.Dtos.Responses;
using api.Services;

namespace api.Controllers.Admin;

[ApiController]
[Route("api/admin/boards")]
public class BoardsController : ControllerBase
{
    private readonly IBoardService _service;

    public BoardsController(IBoardService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BoardResponse>>> GetAll()
        => Ok(await _service.GetAllBoards());

    [HttpGet("{id}")]
    public async Task<ActionResult<BoardResponse>> GetById(string id)
    {
        var board = await _service.GetBoardById(id);
        return board == null ? NotFound() : Ok(board);
    }

    [HttpPost]
    public async Task<ActionResult<BoardResponse>> Create(CreateBoardDto dto)
    {
        var board = await _service.CreateBoard(dto);
        return CreatedAtAction(nameof(GetById), new { id = board.Id }, board);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BoardResponse>> Update(string id, UpdateBoardDto dto)
    {
        var updated = await _service.UpdateBoard(id, dto);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var ok = await _service.DeleteBoard(id);
        return ok ? NoContent() : NotFound();
    }
}