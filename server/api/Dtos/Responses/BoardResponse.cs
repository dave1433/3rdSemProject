namespace api.Dtos.Responses;

public class BoardResponse
{
    public string Id { get; set; } = default!;
    public string PlayerId { get; set; } = default!;
    public string GameId { get; set; } = default!;
    public int[] Numbers { get; set; } = Array.Empty<int>();
    public int Price { get; set; }          // DKK, stored in DB
    public string? RepeatId { get; set; }
    public DateTime? CreatedAt { get; set; }
    
    // Optional helper flags (computed in queries, not DB):
    public bool IsWinningBoard { get; set; }   // fill when you know winning numbers
}