using AutoMapper;
using api.Dtos.Requests;
using api.Dtos.Responses;
using efscaffold.Entities;

namespace api.Mappings;

public class BoardProfile : Profile
{
    public BoardProfile()
    {
        CreateMap<Board, BoardResponse>()
            .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Createdat))
            .ForMember(d => d.PlayerId, o => o.MapFrom(s => s.Playerid))
            .ForMember(d => d.GameId, o => o.MapFrom(s => s.Gameid))
            .ForMember(d => d.RepeatId, o => o.MapFrom(s => s.Repeatid));

        CreateMap<CreateBoardDto, Board>()
            .ForMember(d => d.Playerid, o => o.MapFrom(s => s.PlayerId))
            .ForMember(d => d.Gameid,  o => o.MapFrom(s => s.GameId))
            .ForMember(d => d.Repeatid, o => o.MapFrom(s => s.RepeatId))
            // price + createdAt will be set server-side
            .ForMember(d => d.Price, o => o.Ignore())
            .ForMember(d => d.Createdat, o => o.Ignore());

        CreateMap<UpdateBoardDto, Board>()
            .ForMember(d => d.Repeatid, o => o.MapFrom(s => s.RepeatId))
            .ForAllMembers(o => o.Condition((src, dest, value) => value != null));
    }
}