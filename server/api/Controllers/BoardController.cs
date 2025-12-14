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
    // Authenticated users:
    //  - Player (role 2) can only view own boards
    //  - Admin (role 1) can view any user’s boards
    // ======================================================
    [HttpGet("user/{userId}")]
    [Authorize] // for any authenticated user
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
    [Authorize(Roles = "2")]
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

            // use authenticated ID, ignore any userId in request
            var results = await _boardService.CreatePurchaseAsync(authUser.Id, dtos);

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
    
    // ======================================================
    // PUT /api/board/{boardId}/auto-repeat
    // Player-only: toggle auto-repeat flag on a board
    // ======================================================
    [HttpPut("{boardId}/auto-repeat")]
    [Authorize(Roles = "2")]
    [Produces("application/json")]
    public async Task<ActionResult<AutoRepeatResponse>> SetAutoRepeat(
        string boardId,
        [FromBody] UpdateAutoRepeatRequest request)
    {
        try
        {
            var authUser = await _authService.GetUserInfoAsync(User);
            if (authUser is null) return Unauthorized("User not found from token");

            var result = await _boardService.SetAutoRepeatAsync(authUser.Id, boardId, request.AutoRepeat);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            // used for "cannot restart" rule
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR: SetAutoRepeat failed");
            return StatusCode(500, new { message = "Failed to update auto-repeat", detail = ex.Message });
        }
    }
    
    [HttpGet("purchase/status")]
    [Authorize(Roles = "2")]
    public async Task<ActionResult<IsBoardLockedResponse>> GetIsBoardLockedStatus()
    {
        try
        {
            var result = await _boardService.GetIsBoardLockedAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR: GetPurchaseStatus failed");
            return StatusCode(500, new { message = "Failed to load purchase status", detail = ex.Message });
        }
    }
}
