using efscaffold.Entities;

namespace api.dtos.Responses;

public class BoardPriceDtoResponse
{
    public int FieldsCount { get; set; }
    public int Price { get; set; }

    public BoardPriceDtoResponse(Boardprice entity)
    {
        FieldsCount = entity.Fieldscount;
        Price = entity.Price;
    }

    // empty ctor for serializers
    public BoardPriceDtoResponse() { }
}