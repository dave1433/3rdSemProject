using api.Services;              // <-- REQUIRED
using api.Dtos.Requests;
using api.Dtos.Responses;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using AutoMapper;



public class PlayerService : IPlayerService
{
    private readonly MyDbContext _db;
    private readonly IMapper _mapper;

    public PlayerService(MyDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PlayerResponse?> GetPlayerById(string id)
    {
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Id == id);
        return player == null
            ? null
            : _mapper.Map<PlayerResponse>(player);
    }

    public async Task<PlayerResponse> CreatePlayer(CreatePlayerDto dto)
    {
        var entity = _mapper.Map<Player>(dto);
        entity.Id = Guid.NewGuid().ToString();
        entity.Createdat = DateTime.UtcNow;
        entity.Active = true;
        entity.Balance = 0;

        _db.Players.Add(entity);
        await _db.SaveChangesAsync();

        return _mapper.Map<PlayerResponse>(entity);
    }

    public async Task<UpdatePlayerResponse?> UpdatePlayer(string id, UpdatePlayerDto dto)
    {
        var entity = await _db.Players.FirstOrDefaultAsync(p => p.Id == id);
        if (entity == null)
            return null;

        _mapper.Map(dto, entity);
        await _db.SaveChangesAsync();

        return _mapper.Map<UpdatePlayerResponse>(entity);
    }
}