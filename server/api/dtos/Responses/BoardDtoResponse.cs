using efscaffold.Entities;

namespace api.dtos.Responses;

public class BoardDtoResponse
{
    public BoardDtoResponse(Board entity)
    {
        Id = entity.Id;
        PlayerId = entity.Playerid;
        GameId = entity.Gameid;
        Numbers = entity.Numbers?.ToList() ?? new List<int>();
        Price = entity.Price;
        Times = entity.Times;
        CreatedAt = entity.Createdat;

        Transactions = entity.Transactions?
                           .Select(t => new BoardTransactionDto(t))
                           .ToList()
                       ?? new List<BoardTransactionDto>();
    }

    public string Id { get; set; } = null!;
    public string? PlayerId { get; set; }
    public string? GameId { get; set; }
    public List<int> Numbers { get; set; } = new();
    public int Price { get; set; }
    public int Times { get; set; }
    public DateTime? CreatedAt { get; set; }

    public List<BoardTransactionDto> Transactions { get; set; } = new();
}

public class BoardTransactionDto
{
    public BoardTransactionDto(Transaction t)
    {
        Id = t.Id;
        Type = t.Type;
        Amount = t.Amount;
        Status = t.Status;
        CreatedAt = t.Createdat;
    }

    public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public int Amount { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
}