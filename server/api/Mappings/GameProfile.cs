using AutoMapper;
using api.Dtos.Requests;
using api.Dtos.Responses;
using efscaffold.Entities;

namespace api.Mappings;

public class GameProfile : Profile
{
    public GameProfile()
    {
        // Entity → Response
        CreateMap<Game, GameResponse>()
            .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Createdat))
            .ForMember(d => d.WeekNumber, o => o.MapFrom(s => s.Weeknumber))
            .ForMember(d => d.StartAt, o => o.MapFrom(s => s.Startat))
            .ForMember(d => d.JoinDeadline, o => o.MapFrom(s => s.Joindeadline))
            .ForMember(d => d.WinningNumbers, o => o.MapFrom(s => s.Winningnumbers));

        // Create DTO → Entity
        CreateMap<CreateGameDto, Game>()
            .ForMember(d => d.Startat, o => o.MapFrom(s => s.StartAt))
            .ForMember(d => d.Joindeadline, o => o.MapFrom(s => s.JoinDeadline))
            .ForMember(d => d.Weeknumber, o => o.MapFrom(s => s.WeekNumber));

        // Update DTO → Entity
        CreateMap<UpdateGameDto, Game>()
            .ForMember(d => d.Startat, o => o.MapFrom(s => s.StartAt))
            .ForMember(d => d.Joindeadline, o => o.MapFrom(s => s.JoinDeadline))
            .ForMember(d => d.Winningnumbers, o => o.MapFrom(s => s.WinningNumbers))
            .ForAllMembers(opts => opts.Condition((src, dest, srcValue) =>
                srcValue != null));  // Only map non-null fields
    }
}