using api.dtos.Requests;
using api.dtos.Responses;
using Sieve.Models;

namespace api.Services;

public interface ITransactionService
{
    Task<List<TransactionDtoResponse>> GetByUserAsync(string userId, SieveModel sieveModel);
    Task<List<TransactionDtoResponse>> GetPendingAsync(SieveModel sieveModel);

    Task<TransactionDtoResponse> CreateDepositAsync(CreateTransactionRequest dto);

    /// <summary>
    /// Update status (approved / rejected) and adjust balance if needed.
    /// adminUserId can be null for now if we have no auth wired.
    /// </summary>
    Task<TransactionDtoResponse> UpdateStatusAsync(
        string transactionId,
        UpdateTransactionStatusRequest dto,
        string? adminUserId);
}