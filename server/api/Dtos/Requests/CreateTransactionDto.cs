namespace api.Dtos.Requests;

public class CreateTransactionDto
{
    public string PlayerId { get; set; } = default!;
    
    // 'deposit', 'purchase', 'refund', etc.
    public string Type { get; set; } = default!;
    
    // Positive for deposit, negative for purchase
    public int Amount { get; set; }

    // Optional: link to a board (for purchases/refunds)
    public string? BoardId { get; set; }
}