namespace api.Dtos.Requests;

public class CreateGameDto
{
    public int Year { get; set; }
    public int WeekNumber { get; set; }

    public DateTime? StartAt { get; set; }
    public DateTime? JoinDeadline { get; set; }

    // Winning numbers are NOT known at creation
}