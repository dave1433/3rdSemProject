namespace api.dtos.Responses;

public class RepeatDtoResponse
{
    public string Id { get; set; } = null!;
    public string PlayerId { get; set; } = null!;
    public List<int> Numbers { get; set; } = new();

    /// <summary>Price per week (for this repeat).</summary>
    public int Price { get; set; }

    /// <summary>Weeks still to be auto-played in the future.</summary>
    public int RemainingWeeks { get; set; }

    /// <summary>True if player has opted out / cancelled.</summary>
    public bool OptOut { get; set; }

    public DateTime? CreatedAt { get; set; }

    /// <summary>
    /// Total weeks this repeat was intended to run for.
    /// Computed as RemainingWeeks + BoardsAlreadyPlayed.
    /// </summary>
    public int TotalWeeks { get; set; }

    /// <summary>How many boards have already been created from this repeat.</summary>
    public int PlayedWeeks { get; set; }

    /// <summary>Convenience: "Active" / "Inactive".</summary>
    public string Status { get; set; } = "Inactive";
}
