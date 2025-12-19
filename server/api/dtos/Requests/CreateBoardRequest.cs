using System.ComponentModel.DataAnnotations;

namespace api.dtos.Requests;

public class CreateBoardRequest
{
    [Required]
    public string UserId { get; set; } = null!;

    // 5–8 numbers
    [Required]
    [MinLength(5)]
    [MaxLength(8)]
    public List<int> Numbers { get; set; } = new();

    [Range(1, int.MaxValue)]
    public int Times { get; set; } = 1;
}