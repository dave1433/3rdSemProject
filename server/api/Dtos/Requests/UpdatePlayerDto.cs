namespace api.Dtos.Requests;

public class UpdatePlayerDto
{
    public string FullName { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool Active { get; set; }
    public int Balance { get; set; }
}