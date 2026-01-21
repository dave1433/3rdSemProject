namespace api.Services;
using efscaffold;
using efscaffold.Entities;
public interface IBoardRepository
{
    Task<IEnumerable<Board>> GetBoardsByPlayerIdAsync(string playerId);
    
    IQueryable<Game> Games { get; }
    IQueryable<Board> Boards { get; }
    void AddGame(Game game);
    Task<int> SaveChangesAsync();
}