using AutoMapper;
using api.Dtos.Requests;
using api.Dtos.Responses;
using efscaffold.Entities;

namespace api.Mappings;

public class TransactionProfile : Profile
{
    public TransactionProfile()
    {
        CreateMap<Transaction, TransactionResponse>()
            .ForMember(d => d.PlayerId, o => o.MapFrom(s => s.Playerid))
            .ForMember(d => d.BoardId, o => o.MapFrom(s => s.Boardid))
            .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.Createdat))
            .ForMember(d => d.ProcessedAt, o => o.MapFrom(s => s.Processedat))
            .ForMember(d => d.ProcessedBy, o => o.MapFrom(s => s.Processedby));

        CreateMap<CreateTransactionDto, Transaction>()
            .ForMember(d => d.Playerid, o => o.MapFrom(s => s.PlayerId))
            .ForMember(d => d.Boardid,  o => o.MapFrom(s => s.BoardId))
            .ForMember(d => d.Createdat, o => o.Ignore())
            .ForMember(d => d.Processedby, o => o.Ignore())
            .ForMember(d => d.Processedat, o => o.Ignore());

        CreateMap<UpdateTransactionDto, Transaction>()
            .ForMember(d => d.Processedby, o => o.MapFrom(s => s.ProcessedBy))
            .ForMember(d => d.Processedat, o => o.Ignore())  // set in service
            .ForAllMembers(o => o.Condition((src, dest, value) => value != null));
    }
}