using api.dtos.Requests;
using api.dtos.Responses;
using api.DTOs.Responses;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TransactionService: ITransactionService
{
    private readonly MyDbContext _db;
    
    public TransactionService(MyDbContext db)
    {
        _db = db;
    }
    
    public async Task<List<TransactionDtoResponse>> GetByPlayerAsync(string playerId)
    {
    var transactions = await _db.Transactions
        .Where(t => t.Playerid == playerId)
        .OrderByDescending(t => t.Createdat)
        .ToListAsync();
    return transactions.Select(t => new TransactionDtoResponse(t)).ToList();
    }
    
    public async Task<List<TransactionDtoResponse>> GetPendingAsync()
    {
        var entities = await _db.Transactions
            .Include(t => t.Player)     
            .Where(t => t.Status == "pending")
            .OrderByDescending(t => t.Createdat)
            .ToListAsync();

        return entities.Select(t => new TransactionDtoResponse(t)).ToList();
    }
    
    public async Task<TransactionDtoResponse> CreateDepositAsync(CreateTransactionRequest ctr)
    {
        //Make sure player exists
        var player = await _db.Users
            .SingleOrDefaultAsync(u => u.Id == ctr.PlayerId);
        
        if (player is null)
        {
            throw new ArgumentException("Player not found", nameof(ctr.PlayerId));
        }
        
        var tx = new Transaction
        {
            Id = Guid.NewGuid().ToString(),
            Playerid = ctr.PlayerId,
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

        // Only adjust balance when moving from non-approved to approved
        if (oldStatus != "approved" && newStatus == "approved")
        {
            // only adjust for deposit / refund.
            if (tx.Type is "deposit" or "refund")
            {
                if (tx.Playerid is null)
                {
                    throw new InvalidOperationException("Transaction has no player id.");
                }

                var player = await _db.Users
                    .SingleOrDefaultAsync(u => u.Id == tx.Playerid);

                if (player is null)
                {
                    throw new InvalidOperationException("Player not found for transaction.");
                }

                // deposit/refund: Amount is positive for money going *to* player
                player.Balance += tx.Amount;
            }
        }

        await _db.SaveChangesAsync();

        return new TransactionDtoResponse(tx);
    }
}