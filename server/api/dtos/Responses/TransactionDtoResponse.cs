using efscaffold.Entities;

namespace api.dtos.Responses;

public class TransactionDtoResponse
{
    public TransactionDtoResponse(Transaction entity)
    {
        Id = entity.Id;
        UserId = entity.Playerid; // DB column is still Playerid → map to UserId
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

    public string? UserId { get; set; }

    // New property stays the same
    public string? FullName { get; set; }

    public string Type { get; set; } = null!;
    public int Amount { get; set; }
    public string? MobilePayRef { get; set; }
    public string Status { get; set; } = null!;
    public string? BoardId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? ProcessedBy { get; set; }
    public DateTime? ProcessedAt { get; set; }
}