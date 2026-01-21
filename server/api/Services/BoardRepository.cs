using efscaffold;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Services;

public class BoardRepository : IBoardRepository
{
    private readonly MyDbContext _db;
    public BoardRepository(MyDbContext db)
    {
        _db = db;
    }
    public IQueryable<Game> Games => _db.Games;
    public IQueryable<Board> Boards => _db.Boards;

    public void AddGame(Game game)
    {
        _db.Games.Add(game);
    }

    public async Task<int> SaveChangesAsync()
    {
      return await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Board>> GetBoardsByPlayerIdAsync(string playerId)
    {
        return await this.Boards
            .Where(b => b.Playerid == playerId)
            .ToListAsync();
    }
}