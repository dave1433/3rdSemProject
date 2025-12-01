using api.dtos;
using api.dtos.Responses;
using api.Services;
using efscaffold.Entities;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardController(IBoardService boardService) : ControllerBase
{
    [HttpGet("player/{playerId}")]
    public async Task<ActionResult<List<BoardDtos.BoardDto>>> GetByPlayer(string playerId)
    {
        var boards = await boardService.GetByPlayerAsync(playerId);
        return Ok(boards);
    }

    [HttpPost("purchase")]
    public async Task<ActionResult<List<BoardDtos.BoardDto>>> Purchase(
        [FromBody] List<CreateBoardRequestDto> dtos)
    {
        var result = await boardService.CreateBetsAsync(dtos);
        return Ok(result);
    }
}