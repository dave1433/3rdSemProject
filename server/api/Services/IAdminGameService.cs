using api.dtos.Requests;
using api.dtos.Responses;

namespace api.Services;

public interface IAdminGameService
{
    Task<GameResponse> EnterWinningNumbersAsync(CreateGameDrawRequest request);
    Task<bool> IsWeekLockedAsync(int year, int weekNumber);
    Task<List<WeeklyBoardSummaryDto>> GetWeeklyWinningSummaryAsync();
    Task<List<GameHistoryResponse>> GetDrawHistoryAsync();
}
