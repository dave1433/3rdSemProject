using api.Dtos.Requests;
using api.Dtos.Responses;

namespace api.Services;

public interface ITransactionService
{
    // Admin
    Task<IEnumerable<TransactionResponse>> GetAllTransactions();
    Task<TransactionResponse?> GetTransactionById(string id);
    Task<bool> DeleteTransaction(string id);
    Task<TransactionResponse?> ApproveTransaction(string id, UpdateTransactionDto dto);

    // Admin + Player
    Task<IEnumerable<TransactionResponse>> GetTransactionsByPlayer(string playerId);
    Task<TransactionResponse> CreateTransaction(CreateTransactionDto dto);
}