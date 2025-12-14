namespace api.dtos.Responses;

public class IsBoardLockedResponse
{
    public bool IsOpen { get; set; }
    public string? Message { get; set; }
    public int Year { get; set; }
    public int WeekNumber { get; set; }
}