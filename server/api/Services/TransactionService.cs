using api.Dtos.Requests;
using api.Dtos.Responses;
using AutoMapper;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TransactionService : ITransactionService
{
    private readonly MyDbContext _db;
    private readonly IMapper _mapper;

    public TransactionService(MyDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // -----------------------------
    // Admin
    // -----------------------------
    public async Task<IEnumerable<TransactionResponse>> GetAllTransactions()
    {
        var trx = await _db.Transactions.AsNoTracking().ToListAsync();
        return _mapper.Map<IEnumerable<TransactionResponse>>(trx);
    }

    public async Task<TransactionResponse?> GetTransactionById(string id)
    {
        var trx = await _db.Transactions.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);
        return trx == null ? null : _mapper.Map<TransactionResponse>(trx);
    }

    public async Task<bool> DeleteTransaction(string id)
    {
        var trx = await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id);
        if (trx == null) return false;

        _db.Transactions.Remove(trx);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<TransactionResponse?> ApproveTransaction(string id, UpdateTransactionDto dto)
    {
        var trx = await _db.Transactions
            .Include(t => t.Player)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (trx == null) return null;

        if (trx.Processedby != null)
            throw new InvalidOperationException("Transaction already approved.");

        trx.Processedby = dto.ProcessedBy ?? "admin";  // placeholder — session later
        trx.Processedat = DateTime.UtcNow;

        // Update balance if deposit
        if (trx.Type == "deposit")
        {
            trx.Player.Balance += trx.Amount;
        }

        // For purchases: amount is negative, but balance was already updated earlier

        await _db.SaveChangesAsync();

        return _mapper.Map<TransactionResponse>(trx);
    }

    // -----------------------------
    // Admin + Player
    // -----------------------------
    public async Task<IEnumerable<TransactionResponse>> GetTransactionsByPlayer(string playerId)
    {
        var trx = await _db.Transactions.AsNoTracking()
            .Where(t => t.Playerid == playerId)
            .OrderByDescending(t => t.Createdat)
            .ToListAsync();

        return _mapper.Map<IEnumerable<TransactionResponse>>(trx);
    }

    public async Task<TransactionResponse> CreateTransaction(CreateTransactionDto dto)
    {
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Id == dto.PlayerId);
        if (player == null)
            throw new InvalidOperationException("Player not found.");

        // Create entity
        var trx = _mapper.Map<Transaction>(dto);
        trx.Id = Guid.NewGuid().ToString();
        trx.Createdat = DateTime.UtcNow;
        trx.Processedby = null;
        trx.Processedat = null;

        // Note: balance only updated when approved
        _db.Transactions.Add(trx);
        await _db.SaveChangesAsync();

        return _mapper.Map<TransactionResponse>(trx);
    }
}
