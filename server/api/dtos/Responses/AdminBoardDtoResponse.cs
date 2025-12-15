using efscaffold.Entities;
using System.Globalization;

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
            ? ISOWeek.GetWeekOfYear(board.Createdat.Value)
            : 0;

        IsWinner = board.Iswinner ?? false;

        // ✅ CORRECT: use THIS BOARD'S GAME'S WINNING NUMBERS
        if (board.Game?.Winningnumbers != null)
            WinningNumbers = board.Game.Winningnumbers.ToList();
        else
            WinningNumbers = new List<int>();
    }

    public string BoardId { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }

    public List<int> Numbers { get; set; }
    public int Times { get; set; }

    public int Year { get; set; }
    public int Week { get; set; }
    public DateTime? CreatedAt { get; set; }

    public bool IsWinner { get; set; }

    public List<int> WinningNumbers { get; set; }
}