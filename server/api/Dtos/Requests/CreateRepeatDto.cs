namespace api.Dtos.Requests;

public class CreateRepeatDto
{
    public string PlayerId { get; set; } = default!;
    
    // 5–8 numbers between 1–16
    public int[] Numbers { get; set; } = Array.Empty<int>();
    
    // Price will be calculated from BoardPrice based on Numbers.Length
    public int RemainingWeeks { get; set; }
}