namespace api.dtos.Requests;

public class CreateRepeatRequest
{
    public List<int> Numbers { get; set; } = new();

    /// We don't send px from the client, backend calculates it using boardprice table.
    public int Times { get; set; }

    /// How many weeks the repeat should run.
    public int Weeks { get; set; }
}