using api.dtos.Requests;
using api.dtos.Responses;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionController(ITransactionService service)
    {
        _service = service;
    }

    // POST /api/Transaction/deposit
    [HttpPost("deposit")]
    [Authorize(Policy = "PlayerOnly")]
    public async Task<ActionResult<TransactionDtoResponse>> CreateDeposit(
        [FromBody] CreateTransactionRequest dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var created = await _service.CreateDepositAsync(dto);
        return Ok(created);
    }

    // PUT /api/Transaction/{id}/status
    [HttpPut("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<TransactionDtoResponse>> UpdateStatus(
        string id,
        [FromBody] UpdateTransactionStatusRequest dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // Once you have auth, extract admin ID from JWT
        string? adminUserId = null;

        var updated = await _service.UpdateStatusAsync(id, dto, adminUserId);
        return Ok(updated);
    }
    
    // GET /api/Transaction/user/{userId}
    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<ActionResult<List<TransactionDtoResponse>>> GetByUser(
        string userId,
        [FromQuery] SieveModel sieveModel
    )
    {
        var result = await _service.GetByUserAsync(userId, sieveModel);
        return Ok(result);
    }

    // GET /api/Transaction/pending (Admin view)
    [HttpGet("pending")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<TransactionDtoResponse>>> GetPending(
        [FromQuery] SieveModel sieveModel
    )
    {
        var result = await _service.GetPendingAsync(sieveModel);
        return Ok(result);
    }
}