using api.DTOs.Requests;
using api.DTOs.Responses;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardController : ControllerBase
{
    private readonly IBoardService _boardService;

    public BoardController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    [HttpGet("player/{playerId}")]
    public async Task<ActionResult<List<BoardDto>>> GetByPlayer(string playerId)
    {
        var boards = await _boardService.GetByPlayerAsync(playerId);
        return Ok(boards);
    }

    [HttpPost("purchase")]
    public async Task<ActionResult<List<BoardDto>>> Purchase(
        [FromBody] List<CreateBoardRequest> dtos)
    {
        if (dtos == null || dtos.Count == 0)
            return BadRequest("No boards to purchase.");

        var result = await _boardService.CreateBetsAsync(dtos);
        return Ok(result);
    }
}