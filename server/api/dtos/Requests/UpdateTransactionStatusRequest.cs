using System.ComponentModel.DataAnnotations;

namespace api.dtos.Requests;

public class UpdateTransactionStatusRequest
{
    /// Must be "approved" or "rejected"
    [Required]
    [RegularExpression("approved|rejected", ErrorMessage = "Status must be 'approved' or 'rejected'.")]
    public string Status { get; set; } = null!;
}