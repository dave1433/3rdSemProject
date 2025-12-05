using efscaffold.Entities;

namespace api.DTOs.Responses;   // adjust to match your other DTO namespaces

public class TransactionDtoResponse
{
    public TransactionDtoResponse(Transaction entity)
    {
        Id = entity.Id;
        PlayerId = entity.Playerid;
        FullName = entity.Player != null ? entity.Player.Fullname : null;
        Type = entity.Type;
        Amount = entity.Amount;
        MobilePayRef = entity.Mobilepayref;
        Status = entity.Status;
        BoardId = entity.Boardid;
        CreatedAt = entity.Createdat;
        ProcessedBy = entity.Processedby;
        ProcessedAt = entity.Processedat;
    }

    public string Id { get; set; } = null!;
    public string? PlayerId { get; set; }

    // 👇 new property
    public string? FullName { get; set; }

    public string Type { get; set; } = null!;      // deposit / purchase / refund
    public int Amount { get; set; }                // + deposit / refund, - purchase
    public string? MobilePayRef { get; set; }
    public string Status { get; set; } = null!;    // pending / approved / rejected
    public string? BoardId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? ProcessedBy { get; set; }
    public DateTime? ProcessedAt { get; set; }
}