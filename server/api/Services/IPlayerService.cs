namespace api.Services;
using api.Dtos.Requests;
using api.Dtos.Responses;





public interface IPlayerService
{
    Task<PlayerResponse?> GetPlayerById(string id);
    Task<PlayerResponse> CreatePlayer(CreatePlayerDto dto);
    Task<UpdatePlayerResponse?> UpdatePlayer(string id, UpdatePlayerDto dto);
}