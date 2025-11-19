namespace api.Dtos.Responses;

public class RepeatResponse
{
    public string Id { get; set; } = default!;
    public string PlayerId { get; set; } = default!;
    public int[] Numbers { get; set; } = Array.Empty<int>();
    public int Price { get; set; }          // DKK per game
    public int RemainingWeeks { get; set; }
    public bool OptOut { get; set; }
    public DateTime? CreatedAt { get; set; }
}