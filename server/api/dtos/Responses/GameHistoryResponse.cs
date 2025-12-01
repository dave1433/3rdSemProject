namespace api.dtos.Responses;

public class GameHistoryResponse
{
    public string Id { get; set; } = null!;
    public int Year { get; set; }
    public int WeekNumber { get; set; }
    public List<int> WinningNumbers { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}