using api.dtos.Requests;
using api.dtos.Responses;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/board")]
[Authorize] // require JWT for all endpoints
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

    // ======================================================
    // GET /api/board/user/{userId}
    // Returns all boards purchased by a user
    // ======================================================
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<BoardDtoResponse>>> GetByUser(string userId)
    {
        try
        {
            var authUser = await _authService.GetUserInfoAsync(User);
            if (authUser is null)
                return Unauthorized("User not found in token");

            // Players can ONLY see their own boards
            if (authUser.Role == 2 && authUser.Id != userId)
                return Forbid("Players may view only their own boards.");

            var boards = await _boardService.GetByUserAsync(userId);
            return Ok(boards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR: GetByUser failed");

            return StatusCode(500, new
            {
                message = "Failed to load boards",
                detail  = ex.Message
            });
        }
    }
    
// ======================================================
// GET /api/board/admin/all
// Admin: all purchased boards
// ======================================================
    [HttpGet("admin/all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<AdminBoardDtoResponse>>> GetAllBoardsForAdmin()
    {
        try
        {
            var boards = await _boardService.GetAllBoardsForAdminAsync();
            return Ok(boards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR: Admin board fetch failed");

            return StatusCode(500, new
            {
                message = "Failed to fetch admin boards",
                detail = ex.Message
            });
        }
    }



    // ======================================================
    // POST /api/board/user/purchase
    // Player buys 1..N boards
    // ======================================================
    [HttpPost("user/purchase")]
    public async Task<ActionResult<List<BoardDtoResponse>>> Purchase(
        [FromBody] List<CreateBoardRequest> dtos)
    {
        if (dtos == null || dtos.Count == 0)
            return BadRequest("At least one board must be submitted.");

        try
        {
            var authUser = await _authService.GetUserInfoAsync(User);
            if (authUser is null)
                return Unauthorized("User not found from token");

            // Only players can purchase boards
            if (authUser.Role != 2)
                return Forbid("Only players can purchase boards");

            // 🟢 IMPORTANT — use authenticated ID, ignore any userId in request
            var results = await _boardService.CreateBetsAsync(authUser.Id, dtos);

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR: Purchase failed");

            return StatusCode(500, new
            {
                message = "Failed to purchase boards",
                detail  = ex.Message
            });
        }
    }
}
