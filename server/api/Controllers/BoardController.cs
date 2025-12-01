using api.dtos;
using api.Services;
using efscaffold.Entities;
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

    // GET /api/Board/player/{playerId}
    [HttpGet("player/{playerId}")]
    public async Task<ActionResult<List<Board>>> GetByPlayer(string playerId)
    {
        var boards = await _boardService.GetByPlayerAsync(playerId);
        return Ok(boards);
    }

    // POST /api/Board/purchase
    // body: List<CreateBetDto>
    [HttpPost("purchase")]
    public async Task<ActionResult<List<Board>>> Purchase([FromBody] List<CreateBoardRequest> dtos)
    {
        if (dtos == null || dtos.Count == 0) return BadRequest("No bets provided");

        var boards = await _boardService.CreateBetsAsync(dtos);
        return Ok(boards);
    }
}