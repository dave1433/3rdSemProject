namespace api.Dtos.Requests;

public class CreatePlayerDto
{
    public string FullName { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
}