using efscaffold.Entities;

namespace api.dtos.Responses;

public class AdminBoardDtoResponse
{
    public AdminBoardDtoResponse(Board board, User user)
    {
        BoardId  = board.Id;
        UserId   = user.Id;
        UserName = user.Fullname;

        Numbers  = board.Numbers?.ToList() ?? new();
        Times    = board.Times;

        CreatedAt = board.Createdat;
        Year      = board.Createdat?.Year ?? 0;
        Week      = board.Createdat.HasValue
            ? System.Globalization.ISOWeek.GetWeekOfYear(board.Createdat.Value)
            : 0;

        // ✅ New: map Iswinner (nullable) to a non-nullable bool
        IsWinner = board.Iswinner == true;
    }

    public string BoardId { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }

    public List<int> Numbers { get; set; }
    public int Times { get; set; }

    public int Year { get; set; }
    public int Week { get; set; }
    public DateTime? CreatedAt { get; set; }

    // ✅ New property
    public bool IsWinner { get; set; }
}