using System.ComponentModel.DataAnnotations;

namespace api.dtos.Requests;

    public record AuthRequest{
    [Required]
    [EmailAddress]
    public string Email { get; set; }= null!;
    
    [Required]
    public string Password { get; set; }= null!;
    }
