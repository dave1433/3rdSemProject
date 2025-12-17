using api.dtos.Requests;
using api.dtos.Responses;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace api.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly IUserService _users;

    public UserController(IUserService users)
    {
        _users = users;
    }

    // Only admins can create users
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest req)
        => Ok(await _users.CreateUserAsync(req));

    // Anyone authenticated can list users (admin & player)
    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetUsers(
        [FromQuery] string? q,
        [FromQuery] SieveModel sieveModel
    )
    {
        var users = await _users.GetAllUsersAsync(q, sieveModel);
        return Ok(users);
    }

    // Get information about the currently logged-in user
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse?>> Me()
        => Ok(await _users.GetCurrentAsync(User));

    // Activate a user (admin only)
    [HttpPatch("{id}/activate")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Activate(string id)
        => await _users.ActivateAsync(id) ? Ok() : NotFound();

    // Deactivate a user (admin only)
    [HttpPatch("{id}/deactivate")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Deactivate(string id)
        => await _users.DeactivateAsync(id) ? Ok() : NotFound();
}