using AutoMapper;
using api.Dtos.Requests;
using api.Dtos.Responses;
using efscaffold.Entities;

namespace api.Mappings;

public class PlayerProfile : Profile
{
    public PlayerProfile()
    {
        // Entity → Responses
        CreateMap<Player, PlayerResponse>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Fullname))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Createdat));

        CreateMap<Player, UpdatePlayerResponse>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Fullname));

        // Requests → Entity
        CreateMap<CreatePlayerDto, Player>()
            .ForMember(dest => dest.Fullname, opt => opt.MapFrom(src => src.FullName));

        CreateMap<UpdatePlayerDto, Player>()
            .ForMember(dest => dest.Fullname, opt => opt.MapFrom(src => src.FullName));
    }
}
