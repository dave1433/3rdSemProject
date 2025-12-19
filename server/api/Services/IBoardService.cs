using api.dtos.Requests;
using api.dtos.Responses;

namespace api.Services;

public interface IBoardService
{
    Task<List<BoardDtoResponse>> GetByUserAsync(string userId);
    Task<List<BoardDtoResponse>> CreatePurchaseAsync(string userId, IEnumerable<CreateBoardRequest> dtos);
    Task<List<AdminBoardDtoResponse>> GetAllBoardsForAdminAsync();
    Task<List<WeeklyBoardSummaryDto>> GetWeeklyWinningSummaryAsync();
    Task<AutoRepeatResponse> SetAutoRepeatAsync(string playerId, string boardId, bool autoRepeat);

    // run when winning numbers are selected (game "starts")
    Task ProcessRepeatOrdersForGameAsync(string gameId);
    Task<IsBoardLockedResponse> GetIsBoardLockedAsync();
}