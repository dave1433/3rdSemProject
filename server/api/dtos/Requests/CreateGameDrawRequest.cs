namespace api.dtos.Requests;

public class CreateGameDrawRequest
{
    public int Year { get; set; }
    public int WeekNumber { get; set; }
    public List<int> WinningNumbers { get; set; } = [];
}