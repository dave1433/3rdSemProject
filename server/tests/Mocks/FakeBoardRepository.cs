namespace tests.Mocks;
using api.Services;
using efscaffold.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class FakeBoardRepository : IBoardRepository
{
    private readonly List<Board> _boards = new List<Board>();
    private readonly List<Game> _games = new List<Game>();

    public void SetBoards(IEnumerable<Board> boards)
    {
        _boards.Clear();
        _boards.AddRange(boards);
    }
 
    public void SetGames(IEnumerable<Game> games)
    {
        _games.Clear();
        _games.AddRange(games);
    }
    
    public IQueryable<Game> Games => _games.AsQueryable();
    public IQueryable<Board> Boards => _boards.AsQueryable();
    
    public void AddGame(Game game)
    {
        _games.Add(game);
    }

    public Task<int> SaveChangesAsync()
    { 
       return Task.FromResult(0);
    }
    public Task<IEnumerable<Board>> GetBoardsByPlayerIdAsync(string playerId)
    {
        var playerBoards = _boards.Where(b => b.Playerid == playerId);
        return Task.FromResult(playerBoards.AsEnumerable());
    }

}