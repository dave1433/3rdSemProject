using api.Dtos.Requests;
using api.Dtos.Responses;
using AutoMapper;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class GameService : IGameService
{
    private readonly MyDbContext _db;
    private readonly IMapper _mapper;

    public GameService(MyDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<GameResponse?> GetById(string id)
    {
        var game = await _db.Games.FirstOrDefaultAsync(g => g.Id == id);
        return game == null ? null : _mapper.Map<GameResponse>(game);
    }

    public async Task<IEnumerable<GameResponse>> GetAll()
    {
        var games = await _db.Games.ToListAsync();
        return _mapper.Map<IEnumerable<GameResponse>>(games);
    }

    public async Task<GameResponse> Create(CreateGameDto dto)
    {
        var entity = _mapper.Map<Game>(dto);
        entity.Id = Guid.NewGuid().ToString();
        entity.Createdat = DateTime.UtcNow;

        _db.Games.Add(entity);
        await _db.SaveChangesAsync();

        return _mapper.Map<GameResponse>(entity);
    }

    public async Task<GameResponse?> Update(string id, UpdateGameDto dto)
    {
        var entity = await _db.Games.FirstOrDefaultAsync(g => g.Id == id);
        if (entity == null) return null;

        _mapper.Map(dto, entity);
        await _db.SaveChangesAsync();

        return _mapper.Map<GameResponse>(entity);
    }

    public async Task<bool> Delete(string id)
    {
        var entity = await _db.Games.FirstOrDefaultAsync(g => g.Id == id);
        if (entity == null) return false;

        _db.Games.Remove(entity);
        await _db.SaveChangesAsync();

        return true;
    }
}