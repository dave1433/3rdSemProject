using api.dtos.Requests;
using api.dtos.Responses;
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

        if (user is null)
        {
            throw new ArgumentException("User not found", nameof(ctr.UserId));
        }

        var tx = new Transaction
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = ctr.UserId,          // DB column is Playerid
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

        if (tx is null)
        {
            throw new ArgumentException("Transaction not found", nameof(transactionId));
        }

        var oldStatus = tx.Status;
        var newStatus = dto.Status.ToLowerInvariant();

        if (oldStatus == newStatus)
        {
            return new TransactionDtoResponse(tx);
        }

        if (newStatus is not ("approved" or "rejected"))
        {
            throw new ArgumentException("Status must be 'approved' or 'rejected'.", nameof(dto.Status));
        }

        tx.Status = newStatus;
        tx.Processedby = adminUserId;
        tx.Processedat = DateTime.UtcNow;

        // Balance adjustment only when becoming approved
        if (oldStatus != "approved" && newStatus == "approved")
        {
            if (tx.Type is "deposit" or "refund")
            {
                if (tx.Playerid is null)
                    throw new InvalidOperationException("Transaction missing UserId.");

                var user = await _db.Users
                    .SingleOrDefaultAsync(u => u.Id == tx.Playerid);

                if (user is null)
                    throw new InvalidOperationException("User not found for transaction.");

                // deposit/refund: amount adds to balance
                user.Balance += tx.Amount;
            }
        }

        await _db.SaveChangesAsync();

        return new TransactionDtoResponse(tx);
    }
}
