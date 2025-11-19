using AutoMapper;
using api.Dtos.Requests;
using api.Dtos.Responses;
using efscaffold.Entities;

namespace api.Mappings;

public class RepeatProfile : Profile
{
    public RepeatProfile()
    {
        CreateMap<Repeat, RepeatResponse>()
            .ForMember(d => d.PlayerId, o => o.MapFrom(s => s.Playerid))
            .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Createdat));

        CreateMap<CreateRepeatDto, Repeat>()
            .ForMember(d => d.Playerid, o => o.MapFrom(s => s.PlayerId))
            .ForMember(d => d.Price, o => o.Ignore())      // compute from numbers
            .ForMember(d => d.Optout, o => o.MapFrom(_ => false))
            .ForMember(d => d.Createdat, o => o.Ignore());

        CreateMap<UpdateRepeatDto, Repeat>()
            .ForMember(d => d.Optout, o => o.MapFrom(s => s.OptOut ?? false))
            .ForAllMembers(o => o.Condition((src, dest, value) => value != null));
    }
}