namespace api.Dtos.Responses;

public class GameResponse
{
    public string Id { get; set; } = default!;

    public int Year { get; set; }
    public int WeekNumber { get; set; }

    public DateTime? StartAt { get; set; }
    public DateTime? JoinDeadline { get; set; }
    public int[]? WinningNumbers { get; set; }

    public DateTime? CreatedAt { get; set; }
}