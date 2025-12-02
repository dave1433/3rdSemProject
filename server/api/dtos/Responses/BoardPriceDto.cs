using efscaffold.Entities;

namespace api.DTOs.Responses;

public class BoardPriceDto
{
    public int FieldsCount { get; set; }
    public int Price { get; set; }

    public BoardPriceDto(Boardprice entity)
    {
        FieldsCount = entity.Fieldscount;
        Price = entity.Price;
    }

    // empty ctor for serializers
    public BoardPriceDto() { }
}