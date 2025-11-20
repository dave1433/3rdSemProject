namespace api.Dtos.Requests;

public class UpdateBoardDto
{
    public int[]? Numbers { get; set; }
    
    // Maybe allow re-linking to a repeat setup
    public string? RepeatId { get; set; }
}