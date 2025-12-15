using api.Services;
using api.dtos.Requests;
using api.dtos.Responses;

public class FakeBoardService : IBoardService
{
    public Task<List<WeeklyBoardSummaryDto>> GetWeeklyWinningSummaryAsync()
    {
        return Task.FromResult(new List<WeeklyBoardSummaryDto>());
    }

    public Task<List<BoardDtoResponse>> GetByUserAsync(string userId)
    {
        throw new NotImplementedException();
    }

    public Task<List<BoardDtoResponse>> CreatePurchaseAsync(
        string userId,
        IEnumerable<CreateBoardRequest> boards)
    {
        throw new NotImplementedException();
    }

    public Task<List<AdminBoardDtoResponse>> GetAllBoardsForAdminAsync()
    {
        throw new NotImplementedException();
    }

    public Task<AutoRepeatResponse> SetAutoRepeatAsync(
        string userId,
        string boardId,
        bool enabled)
    {
        throw new NotImplementedException();
    }

    public Task ProcessRepeatOrdersForGameAsync(string gameId)
    {
        throw new NotImplementedException();
    }

    public Task<IsBoardLockedResponse> GetIsBoardLockedAsync()
    {
        return Task.FromResult(new IsBoardLockedResponse());
    }

}