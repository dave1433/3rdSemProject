using api.dtos.Requests;
using api.dtos.Responses;
using api.Errors;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TransactionService : ITransactionService
{
    private readonly MyDbContext _db;

    public TransactionService(MyDbContext db)
    {
        _db = db;
    }

    // --------------------------------------------------
    // GET transactions for user
    // --------------------------------------------------
    public async Task<List<TransactionDtoResponse>> GetByUserAsync(string userId)
    {
        var transactions = await _db.Transactions
            .Where(t => t.Playerid == userId)
            .OrderByDescending(t => t.Createdat)
            .ToListAsync();

        return transactions.Select(t => new TransactionDtoResponse(t)).ToList();
    }

    // --------------------------------------------------
    // GET pending transactions (admin)
    // --------------------------------------------------
    public async Task<List<TransactionDtoResponse>> GetPendingAsync()
    {
        var entities = await _db.Transactions
            .Include(t => t.Player)
            .Where(t => t.Status == "pending")
            .OrderByDescending(t => t.Createdat)
            .ToListAsync();

        return entities.Select(t => new TransactionDtoResponse(t)).ToList();
    }

    // --------------------------------------------------
    // CREATE deposit request
    // --------------------------------------------------
    public async Task<TransactionDtoResponse> CreateDepositAsync(
        CreateTransactionRequest ctr)
    {
        var user = await _db.Users
            .SingleOrDefaultAsync(u => u.Id == ctr.UserId);

        if (user == null)
            throw ApiErrors.NotFound(
                "The specified user could not be found.");

        var tx = new Transaction
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = ctr.UserId,
            Type = "deposit",
            Amount = ctr.Amount,
            Mobilepayref = ctr.MobilePayRef,
            Status = "pending",
            Boardid = null,
            Createdat = DateTime.UtcNow,
            Processedby = null,
            Processedat = null
        };

        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        return new TransactionDtoResponse(tx);
    }

    // --------------------------------------------------
    // UPDATE transaction status
    // --------------------------------------------------
    public async Task<TransactionDtoResponse> UpdateStatusAsync(
        string transactionId,
        UpdateTransactionStatusRequest dto,
        string? adminUserId)
    {
        var tx = await _db.Transactions
            .SingleOrDefaultAsync(t => t.Id == transactionId);

        if (tx == null)
            throw ApiErrors.NotFound(
                "The transaction could not be found.");

        var oldStatus = tx.Status;
        var newStatus = dto.Status.ToLowerInvariant();

        if (oldStatus == newStatus)
            return new TransactionDtoResponse(tx);

        if (newStatus is not ("approved" or "rejected"))
            throw ApiErrors.BadRequest(
                "Transaction status must be either 'approved' or 'rejected'.");

        tx.Status = newStatus;
        tx.Processedby = adminUserId;
        tx.Processedat = DateTime.UtcNow;

        // Balance adjustment only when becoming approved
        if (oldStatus != "approved" && newStatus == "approved")
        {
            if (tx.Type is "deposit" or "refund")
            {
                if (tx.Playerid == null)
                    throw ApiErrors.Conflict(
                        "This transaction is missing a user reference.");

                var user = await _db.Users
                    .SingleOrDefaultAsync(u => u.Id == tx.Playerid);

                if (user == null)
                    throw ApiErrors.NotFound(
                        "The user associated with this transaction could not be found.");

                // deposit / refund increases balance
                user.Balance += tx.Amount;
            }
        }

        await _db.SaveChangesAsync();

        return new TransactionDtoResponse(tx);
    }
}
