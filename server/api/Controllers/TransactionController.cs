using api.dtos.Requests;
using api.dtos.Responses;
using api.DTOs.Responses;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionController(ITransactionService service)
    {
        _service = service;
    }

    // GET /api/Transaction/player/{playerId}
    [HttpGet("player/{playerId}")]
    public async Task<ActionResult<List<TransactionDtoResponse>>> GetByPlayer(string playerId)
    {
        var result = await _service.GetByPlayerAsync(playerId);
        return Ok(result);
    }

    // GET /api/Transaction/pending   (Admin view)
    [HttpGet("pending")]
    public async Task<ActionResult<List<TransactionDtoResponse>>> GetPending()
    {
        var result = await _service.GetPendingAsync();
        return Ok(result);
    }

    // POST /api/Transaction/deposit
    // Create a pending deposit (later admin approves).
    [HttpPost("deposit")]
    public async Task<ActionResult<TransactionDtoResponse>> CreateDeposit(
        [FromBody] CreateTransactionRequest dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var created = await _service.CreateDepositAsync(dto);
        return Ok(created);
    }

    // PUT /api/Transaction/{id}/status
    // Approve / reject transaction
    [HttpPut("{id}/status")]
    public async Task<ActionResult<TransactionDtoResponse>> UpdateStatus(
        string id,
        [FromBody] UpdateTransactionStatusRequest dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        // TODO: when you have auth, get admin user id from JWT:
        // var adminUserId = User.FindFirst("sub")?.Value;
        string? adminUserId = null;

        var updated = await _service.UpdateStatusAsync(id, dto, adminUserId);
        return Ok(updated);
    }
    
}