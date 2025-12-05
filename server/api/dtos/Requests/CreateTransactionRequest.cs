using System.ComponentModel.DataAnnotations;

namespace api.dtos.Requests;

public class CreateTransactionRequest
{
    [Required]
    public string UserId { get; set; } = null!;

    [Range(1, int.MaxValue)] // ensure amount is positive
    public int Amount { get; set; }

    public string? MobilePayRef { get; set; }
}