using api.DTOs.Requests;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/board")]
public class BoardController : ControllerBase
{
    private readonly IBoardService _boardService;

    public BoardController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    // GET /api/board/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(string userId)
    {
        try
        {
            var boards = await _boardService.GetByUserAsync(userId);
            return Ok(boards);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR GetByUser: {ex}");
            return StatusCode(500, new { message = "Failed to load boards", detail = ex.Message });
        }
    }

    // POST /api/board/user/purchase
    [HttpPost("user/purchase")]
    public async Task<IActionResult> Purchase([FromBody] List<CreateBoardRequest> dtos)
    {
        try
        {
            if (dtos == null || dtos.Count == 0)
                return BadRequest("No boards to purchase.");

            var result = await _boardService.CreateBetsAsync(dtos);
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR Purchase: {ex}");
            return StatusCode(500, new { message = "Failed to purchase", detail = ex.Message });
        }
    }
}