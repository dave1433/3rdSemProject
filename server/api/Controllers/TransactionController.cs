using api.dtos.Requests;
using api.dtos.Responses;
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

    // GET /api/Transaction/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<TransactionDtoResponse>>> GetByUser(string userId)
    {
        var result = await _service.GetByUserAsync(userId);
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
    [HttpPost("deposit")]
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
}