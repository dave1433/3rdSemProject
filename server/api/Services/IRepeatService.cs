using api.dtos.Requests;
using api.dtos.Responses;

namespace api.Services;

public interface IRepeatService
{
    Task<RepeatDtoResponse> CreateAsync(string playerId, CreateRepeatRequest request, CancellationToken ct = default);

    Task<IReadOnlyList<RepeatDtoResponse>> GetByPlayerAsync(string playerId, CancellationToken ct = default);

    Task StopAsync(string playerId, string repeatId, CancellationToken ct = default);

    /// <summary>
    /// Generate boards for all active repeats for a given game (week).
    /// Call this when you create a new Game / start a new round.
    /// </summary>
    Task GenerateBoardsForGameAsync(string gameId, CancellationToken ct = default);
}