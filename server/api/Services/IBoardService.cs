using api.dtos;
using api.dtos.Responses;
using efscaffold.Entities;

namespace api.Services;

public interface IBoardService
{
    /// Returns all boards for a given player, newest first.
    Task<List<BoardDtos.BoardDto>> GetByPlayerAsync(string playerId);

    /// Creates one or more bets (boards + transactions) for the given player(s).
    Task<List<BoardDtos.BoardDto>> CreateBetsAsync(IEnumerable<CreateBoardRequestDto> dtos);
}