using Microsoft.AspNetCore.Mvc;
using api.Services;
using api.Dtos.Responses;
using api.Dtos.Requests;

namespace api.Controllers.Player;

[ApiController]
[Route("api/player/transactions")]
public class MyTransactionsController : ControllerBase
{
    private readonly ITransactionService _service;

    public MyTransactionsController(ITransactionService service)
    {
        _service = service;
    }

    private string GetPlayerId() => Request.Headers["X-PlayerId"]!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionResponse>>> GetMyTransactions()
        => Ok(await _service.GetTransactionsByPlayer(GetPlayerId()));

    [HttpPost("deposit")]
    public async Task<ActionResult<TransactionResponse>> CreateDeposit(CreateTransactionDto dto)
    {
        dto.PlayerId = GetPlayerId();
        dto.Type = "deposit";
        var trx = await _service.CreateTransaction(dto);
        return Ok(trx);
    }
}