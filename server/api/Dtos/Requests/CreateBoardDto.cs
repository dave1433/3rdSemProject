namespace api.Dtos.Requests;

public class CreateBoardDto
{
    public string PlayerId { get; set; } = default!;
    public string GameId { get; set; } = default!;
    
    // 5–8 numbers in range 1–16 (validation to be added)
    public int[] Numbers { get; set; } = Array.Empty<int>();
    
    // Optional: link to a repeating setup
    public string? RepeatId { get; set; }
}