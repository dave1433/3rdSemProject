namespace api.Dtos.Responses;

public class TransactionResponse
{
    public string Id { get; set; } = default!;
    public string PlayerId { get; set; } = default!;
    public string Type { get; set; } = default!;
    public int Amount { get; set; }
    public string? BoardId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? ProcessedBy { get; set; }
    public DateTime? ProcessedAt { get; set; }

    // Convenience flag for UI
    public bool IsPending => ProcessedBy == null;
}