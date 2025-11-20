using Microsoft.AspNetCore.Mvc;
using api.Dtos.Requests;
using api.Dtos.Responses;
using api.Services;

namespace api.Controllers.Player;

[ApiController]
[Route("api/player/boards")]
public class MyBoardsController : ControllerBase
{
    private readonly IBoardService _service;

    public MyBoardsController(IBoardService service)
    {
        _service = service;
    }

    // TODO: Replace with session after auth
    private string GetPlayerId() => Request.Headers["X-PlayerId"]!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BoardResponse>>> GetMyBoards()
        => Ok(await _service.GetBoardsByPlayer(GetPlayerId()));

    [HttpPost]
    public async Task<ActionResult<BoardResponse>> Create(CreateBoardDto dto)
    {
        dto.PlayerId = GetPlayerId();
        var board = await _service.CreateBoard(dto);
        return Ok(board);
    }
}