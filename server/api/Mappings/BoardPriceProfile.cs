using AutoMapper;
using api.Dtos.Responses;
using efscaffold.Entities;

namespace api.Mappings;

public class BoardPriceProfile : Profile
{
    public BoardPriceProfile()
    {
        CreateMap<Boardprice, BoardPriceResponse>();
    }
}