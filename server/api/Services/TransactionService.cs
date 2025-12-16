using api.dtos.Requests;
using api.dtos.Responses;
using api.Errors;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace api.Services;

public class TransactionService : ITransactionService
{
    private readonly MyDbContext _db;
    private readonly SieveProcessor _sieve;

    public TransactionService(MyDbContext db, SieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    // GET /api/Transaction/user/{userId}
    public async Task<List<TransactionDtoResponse>> GetByUserAsync(string userId, SieveModel sieveModel)
    {
        var query = _db.Transactions
            .Where(t => t.Playerid == userId)
            .AsNoTracking()
            .AsQueryable();

        // Optional: default sort if client didn't send sorts
        if (string.IsNullOrWhiteSpace(sieveModel.Sorts))
            sieveModel.Sorts = "-createdat";

        query = _sieve.Apply(sieveModel, query);

        var transactions = await query.ToListAsync();
        return transactions.Select(t => new TransactionDtoResponse(t)).ToList();
    }

    public async Task<List<TransactionDtoResponse>> GetPendingAsync(SieveModel sieveModel)
    {
        var query = _db.Transactions
            .Include(t => t.Player)
            .Where(t => t.Status == "pending")
            .AsNoTracking()
            .AsQueryable();

        if (string.IsNullOrWhiteSpace(sieveModel.Sorts))
            sieveModel.Sorts = "-createdat";

        query = _sieve.Apply(sieveModel, query);

        var entities = await query.ToListAsync();
        return entities.Select(t => new TransactionDtoResponse(t)).ToList();
    }


    // POST create deposit request
    public async Task<TransactionDtoResponse> CreateDepositAsync(CreateTransactionRequest ctr)
    {
        // ensure user exists
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
        Console.WriteLine("TX saved. ConnStr: " + _db.Database.GetConnectionString());

        return new TransactionDtoResponse(tx);
        
    }

    // PUT update transaction status
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
