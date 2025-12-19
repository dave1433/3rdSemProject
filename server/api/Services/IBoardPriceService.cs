using efscaffold.Entities;

namespace api.Services;

public interface IBoardPriceService
{
    Task<IReadOnlyList<Boardprice>> GetAllAsync();
    Task<int> GetPricePerBoardAsync(int fieldsCount);
}