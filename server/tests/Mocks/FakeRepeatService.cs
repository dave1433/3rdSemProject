using api.Services;
using api.dtos.Requests;
using api.dtos.Responses;

public class FakeRepeatService : IRepeatService
{
    public bool WasCalled { get; private set; }

    public Task GenerateBoardsForGameAsync(
        string gameId,
        CancellationToken cancellationToken = default)
    {
        WasCalled = true;
        return Task.CompletedTask;
    }

    public Task<RepeatDtoResponse> CreateAsync(
        string userId,
        CreateRepeatRequest request,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<IReadOnlyList<RepeatDtoResponse>> GetByPlayerAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task StopAsync(
        string userId,
        string repeatId,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}