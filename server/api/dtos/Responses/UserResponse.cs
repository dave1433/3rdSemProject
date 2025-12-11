public class UserResponse
{
    public string Id { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Email { get; set; } = default!;
    public bool Active { get; set; }
    public int Balance { get; set; }
    public int Role { get; set; }    
    public DateTime CreatedAt { get; set; }
}