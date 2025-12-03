using System.ComponentModel.DataAnnotations;

namespace api.DTOs.Requests;

public class CreateBoardRequest
{
    [Required]
    public string UserId { get; set; } = null!;

    // 5–8 numbers from 1–16
    [Required]
    [MinLength(5)]
    [MaxLength(8)]
    public List<int> Numbers { get; set; } = new();

    [Range(1, int.MaxValue)]
    public int Times { get; set; } = 1;
}