namespace api.Dtos.Requests;

public class UpdateRepeatDto
{
    public int[]? Numbers { get; set; }
    public int? RemainingWeeks { get; set; }
    public bool? OptOut { get; set; }   // true → stop repeating
}