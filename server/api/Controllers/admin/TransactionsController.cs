using Microsoft.AspNetCore.Mvc;
using api.Dtos.Requests;
using api.Dtos.Responses;
using api.Services;

namespace api.Controllers.Admin;

[ApiController]
[Route("api/admin/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionsController(ITransactionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionResponse>>> GetAll()
        => Ok(await _service.GetAllTransactions());

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionResponse>> GetById(string id)
    {
        var trx = await _service.GetTransactionById(id);
        return trx == null ? NotFound() : Ok(trx);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionResponse>> Create(CreateTransactionDto dto)
    {
        var trx = await _service.CreateTransaction(dto);
        return CreatedAtAction(nameof(GetById), new { id = trx.Id }, trx);
    }

    [HttpPut("{id}/approve")]
    public async Task<ActionResult<TransactionResponse>> Approve(string id, UpdateTransactionDto dto)
    {
        var result = await _service.ApproveTransaction(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var ok = await _service.DeleteTransaction(id);
        return ok ? NoContent() : NotFound();
    }
}