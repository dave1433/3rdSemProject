using api.dtos;
using efscaffold.Entities;

namespace api.Services;

public interface IBoardService
{
    /// Returns all boards for a given player, newest first.
    Task<List<Board>> GetByPlayerAsync(string playerId);

    /// Creates one or more bets (boards + transactions) for the given player(s).
    Task<List<Board>> CreateBetsAsync(IEnumerable<CreateBoardRequest> dtos);
}