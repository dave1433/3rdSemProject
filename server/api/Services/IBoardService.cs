using api.DTOs.Requests;
using api.DTOs.Responses;

namespace api.Services;

public interface IBoardService
{
    Task<List<BoardDto>> GetByUserAsync(string userId);
    Task<List<BoardDto>> CreateBetsAsync(IEnumerable<CreateBoardRequest> dtos);
}