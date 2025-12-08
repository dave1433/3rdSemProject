using api.dtos.Requests;
using api.dtos.Responses;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/board")]
[Authorize] // all endpoints in this controller require JWT
public class BoardController : ControllerBase
{
    private readonly IBoardService _boardService;
    private readonly IAuthService _authService;
    private readonly ILogger<BoardController> _logger;

    public BoardController(
        IBoardService boardService,
        IAuthService authService,
        ILogger<BoardController> logger)
    {
        _boardService = boardService;
        _authService  = authService;
        _logger       = logger;
    }

    // ===================== GET HISTORY =====================
    // GET /api/board/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<BoardDtoResponse>>> GetByUser(string userId)
    {
        try
        {
            var authUser = await _authService.GetUserInfoAsync(User);
            if (authUser is null)
                return Unauthorized();

            // Role 2 = player – only see own boards
            if (authUser.Role == 2 && authUser.Id != userId)
                return Forbid("Players can only see their own boards.");

            var boards = await _boardService.GetByUserAsync(userId);
            return Ok(boards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR GetByUser");
            return StatusCode(500, new
            {
                message = "Failed to load boards",
                detail  = ex.Message
            });
        }
    }

    // ===================== PURCHASE =====================
    // POST /api/board/user/purchase
    [HttpPost("user/purchase")]
    public async Task<ActionResult<List<BoardDtoResponse>>> Purchase(
        [FromBody] List<CreateBoardRequest> dtos)
    {
        if (dtos == null || dtos.Count == 0)
            return BadRequest("No boards to purchase.");

        try
        {
            var authUser = await _authService.GetUserInfoAsync(User);
            if (authUser is null)
                return Unauthorized("User not found from token");

            // only players can purchase
            if (authUser.Role != 2)
                return Forbid("Only players can purchase boards.");

            // Always use authenticated ID – ignore any userId from body
            var boards = await _boardService.CreateBetsAsync(authUser.Id, dtos);

            return Ok(boards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR Purchase");
            return StatusCode(500, new
            {
                message = "Failed to purchase",
                detail  = ex.Message
            });
        }
    }
}
