//for player to create a new board (make the btn submit work)
public class CreateBoardRequest
{
    public string PlayerId { get; set; } = null!;   // user.id
    public int[] Numbers { get; set; } = Array.Empty<int>(); // 5–8 numbers
    public int Times { get; set; } = 1;             // from UI
}