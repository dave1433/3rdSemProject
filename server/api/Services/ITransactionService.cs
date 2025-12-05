using api.dtos.Requests;
using api.dtos.Responses;
using api.DTOs.Responses;

namespace api.Services;

public interface ITransactionService
{
    Task<List<TransactionDtoResponse>> GetByUserAsync(string userId);
    Task<List<TransactionDtoResponse>> GetPendingAsync();

    Task<TransactionDtoResponse> CreateDepositAsync(CreateTransactionRequest dto);

    /// <summary>
    /// Update status (approved / rejected) and adjust balance if needed.
    /// adminUserId can be null for now if you don't have auth wired.
    /// </summary>
    Task<TransactionDtoResponse> UpdateStatusAsync(
        string transactionId,
        UpdateTransactionStatusRequest dto,
        string? adminUserId);
}