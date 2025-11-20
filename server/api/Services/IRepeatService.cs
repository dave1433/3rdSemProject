using api.Dtos.Requests;
using api.Dtos.Responses;

namespace api.Services;

public interface IRepeatService
{
    // Admin
    Task<IEnumerable<RepeatResponse>> GetAllRepeats();
    Task<RepeatResponse?> GetRepeatById(string id);
    Task<RepeatResponse> CreateRepeat(CreateRepeatDto dto);
    Task<RepeatResponse?> UpdateRepeat(string id, UpdateRepeatDto dto);
    Task<bool> DeleteRepeat(string id);

    // Player
    Task<IEnumerable<RepeatResponse>> GetRepeatsByPlayer(string playerId);
}