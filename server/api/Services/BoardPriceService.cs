using efscaffold;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BoardPriceService : IBoardPriceService
{
    private readonly MyDbContext _db;

    public BoardPriceService(MyDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Boardprice>> GetAllAsync()
    {
        return await _db.Boardprices
            .AsNoTracking()
            .OrderBy(bp => bp.Fieldscount)
            .ToListAsync();
    }

    public async Task<int> GetPricePerBoardAsync(int fieldsCount)
    {
        var row = await _db.Boardprices
            .AsNoTracking()
            .SingleOrDefaultAsync(bp => bp.Fieldscount == fieldsCount);

        if (row == null)
            throw new InvalidOperationException(
                $"No board price configured for {fieldsCount} fields.");

        return row.Price;
    }
}