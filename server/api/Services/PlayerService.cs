using api.Dtos.Requests;
using api.Dtos.Responses;
using AutoMapper;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PlayerService : IPlayerService
{
    private readonly MyDbContext _db;
    private readonly IMapper _mapper;

    public PlayerService(MyDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PlayerResponse> CreatePlayer(CreatePlayerDto dto)
    {
        var player = new Player
        {
            Id        = Guid.NewGuid().ToString(),
            Fullname  = dto.FullName,
            Phone     = dto.Phone,
            Email     = dto.Email,
            Active    = true,                 // default
            Balance   = 0,                    // default
            Createdat = DateTime.UtcNow
        };

        _db.Players.Add(player);
        await _db.SaveChangesAsync();

        return _mapper.Map<PlayerResponse>(player);
    }

    public async Task<UpdatePlayerResponse?> UpdatePlayer(string id, UpdatePlayerDto dto)
    {
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Id == id);
        if (player == null) return null;

        player.Fullname = dto.FullName;
        player.Phone    = dto.Phone;
        player.Email    = dto.Email;
        player.Active   = dto.Active;
        player.Balance  = dto.Balance;

        await _db.SaveChangesAsync();

        return _mapper.Map<UpdatePlayerResponse>(player);
    }

    public async Task<PlayerResponse?> GetPlayerById(string id)
    {
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Id == id);
        return player == null ? null : _mapper.Map<PlayerResponse>(player);
    }

    public async Task<IEnumerable<PlayerResponse>> GetAllPlayers()
    {
        var players = await _db.Players.AsNoTracking().ToListAsync();
        return _mapper.Map<IEnumerable<PlayerResponse>>(players);
    }

	
}