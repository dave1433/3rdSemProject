using System.ComponentModel.DataAnnotations;
//for player to create a new board
public record CreateBoardRequestDto
{
    [Required]
    public string PlayerId { get; set; } = null!;

    // 5–8 numbers, 1–16. We validate the length here
    [Required]
    [MinLength(5)]
    [MaxLength(8)]
    public int[] Numbers { get; set; } = Array.Empty<int>();

    // How many identical boards the player buys
    [Range(1, int.MaxValue)]
    public int Times { get; set; } = 1;
}