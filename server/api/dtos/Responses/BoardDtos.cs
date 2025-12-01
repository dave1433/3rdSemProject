using efscaffold.Entities;

namespace api.dtos.Responses;

public class BoardDtos
{
    /// <summary>
    /// Basic board info used for player views (board page, history, etc.).
    /// </summary>
    public class BoardDto
    {
        public BoardDto(Board entity)
        {
            Id = entity.Id;
            PlayerId = entity.Playerid;
            GameId = entity.Gameid;
            Numbers = entity.Numbers?.ToArray() ?? Array.Empty<int>();
            Price = entity.Price;
            RepeatId = entity.Repeatid;
            CreatedAt = entity.Createdat;
        }

        public string Id { get; set; } = null!;
        public string? PlayerId { get; set; }
        public string? GameId { get; set; }
        public int[] Numbers { get; set; } = Array.Empty<int>();
        public int Price { get; set; }
        public string? RepeatId { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    /// <summary>
    /// Optional: shape that is nice for the PlayerHistoryPage
    /// (includes calculated fields like Fields and Times if you want).
    /// You can use this later if needed.
    /// </summary>
    public class PlayerBoardHistoryItemDto
    {
        public PlayerBoardHistoryItemDto(Board entity, int times)
        {
            Id = entity.Id;
            CreatedAt = entity.Createdat;
            Numbers = entity.Numbers?.ToArray() ?? Array.Empty<int>();
            Fields = Numbers.Length;
            Times = times;
            TotalAmountDkk = entity.Price * times; // adjust if your price logic differs
        }

        public string Id { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
        public int[] Numbers { get; set; } = Array.Empty<int>();
        public int Fields { get; set; }
        public int Times { get; set; }
        public int TotalAmountDkk { get; set; }
    }
}