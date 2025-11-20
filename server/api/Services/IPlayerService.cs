using api.Dtos.Requests;
using api.Dtos.Responses;

namespace api.Services;

public interface IPlayerService
{
    Task<PlayerResponse> CreatePlayer(CreatePlayerDto dto);
    Task<UpdatePlayerResponse?> UpdatePlayer(string id, UpdatePlayerDto dto);
    Task<PlayerResponse?> GetPlayerById(string id);
    Task<IEnumerable<PlayerResponse>> GetAllPlayers();

}