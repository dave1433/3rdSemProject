using api.Dtos.Requests;
using api.Dtos.Responses;

namespace api.Services;

public interface IBoardService
{
    // Admin
    Task<IEnumerable<BoardResponse>> GetAllBoards();
    Task<BoardResponse?> GetBoardById(string id);
    Task<bool> DeleteBoard(string id);

    // Player / Admin
    Task<IEnumerable<BoardResponse>> GetBoardsByPlayer(string playerId);
    Task<BoardResponse> CreateBoard(CreateBoardDto dto);
    Task<BoardResponse?> UpdateBoard(string id, UpdateBoardDto dto);
}