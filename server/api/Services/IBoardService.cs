using api.DTOs.Requests;
using api.DTOs.Responses;

namespace api.Services;

public interface IBoardService
{
    Task<List<BoardDtoResponse>> GetByPlayerAsync(string playerId);
    Task<List<BoardDtoResponse>> CreateBetsAsync(IEnumerable<CreateBoardRequest> dtos);
}