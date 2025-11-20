using api.Dtos.Requests;
using api.Dtos.Responses;

namespace api.Services;

public interface IGameService
{
    Task<GameResponse?> GetById(string id);
    Task<IEnumerable<GameResponse>> GetAll();
    Task<GameResponse> Create(CreateGameDto dto);
    Task<GameResponse?> Update(string id, UpdateGameDto dto);
    Task<bool> Delete(string id);
}