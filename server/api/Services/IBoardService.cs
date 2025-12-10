using api.dtos.Requests;
using api.dtos.Responses;

namespace api.Services;

public interface IBoardService
{
    Task<List<BoardDtoResponse>> GetByUserAsync(string userId);
    Task<List<BoardDtoResponse>> CreateBetsAsync(string userId, IEnumerable<CreateBoardRequest> dtos);
    Task<List<AdminBoardDtoResponse>> GetAllBoardsForAdminAsync();
    
    Task<List<WeeklyBoardSummaryDto>> GetWeeklyWinningSummaryAsync();
}