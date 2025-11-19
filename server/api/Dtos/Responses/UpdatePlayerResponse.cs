namespace api.Dtos.Responses;

public class UpdatePlayerResponse
{
    public string Id { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool Active { get; set; }
    public int Balance { get; set; }
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
}