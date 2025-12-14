namespace api.dtos.Responses;

public class AutoRepeatResponse
{
    public string BoardId { get; set; } = default!;
    public bool AutoRepeat { get; set; }
    public string? RepeatId { get; set; }
    public bool IsStopped { get; set; } // optOut == true
}