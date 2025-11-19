namespace api.Dtos.Requests;

public class UpdateGameDto
{
    public DateTime? StartAt { get; set; }
    public DateTime? JoinDeadline { get; set; }
    public int[]? WinningNumbers { get; set; }
}