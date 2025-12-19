using api.Services;
using api.Errors;
using efscaffold.Entities;
using Xunit;

[Collection("Postgres")]
public class BoardPriceServiceTests
{
    private readonly PostgresFixture _db;

    public BoardPriceServiceTests(PostgresFixture db)
    {
        _db = db;
    }

    // ---------------------------------
    // GET ALL
    // ---------------------------------
    [Fact]
    public async Task GetAllAsync_ReturnsPricesOrderedByFieldsCount()
    {
        using var ctx = _db.CreateContext();

        // Clean DB to avoid cross-test pollution
        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        await ctx.SaveChangesAsync();

        ctx.Boardprices.AddRange(
            new Boardprice { Fieldscount = 5, Price = 50 },
            new Boardprice { Fieldscount = 3, Price = 30 },
            new Boardprice { Fieldscount = 7, Price = 70 }
        );

        await ctx.SaveChangesAsync();

        var service = new BoardPriceService(ctx);

        var result = await service.GetAllAsync();

        Assert.Equal(3, result.Count);
        Assert.Equal(3, result[0].Fieldscount);
        Assert.Equal(5, result[1].Fieldscount);
        Assert.Equal(7, result[2].Fieldscount);
    }

    // ---------------------------------
    // GET PRICE PER BOARD
    // ---------------------------------
    [Fact]
    public async Task GetPricePerBoardAsync_ReturnsCorrectPrice()
    {
        using var ctx = _db.CreateContext();

        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        await ctx.SaveChangesAsync();

        ctx.Boardprices.Add(new Boardprice
        {
            Fieldscount = 6,
            Price = 60
        });

        await ctx.SaveChangesAsync();

        var service = new BoardPriceService(ctx);

        var price = await service.GetPricePerBoardAsync(6);

        Assert.Equal(60, price);
    }

    // ---------------------------------
    // GET PRICE PER BOARD - NOT FOUND
    // ---------------------------------
    [Fact]
    public async Task GetPricePerBoardAsync_ThrowsNotFound_WhenMissing()
    {
        using var ctx = _db.CreateContext();

        ctx.Boardprices.RemoveRange(ctx.Boardprices);
        await ctx.SaveChangesAsync();

        var service = new BoardPriceService(ctx);

        var ex = await Assert.ThrowsAsync<ApiException>(() =>
            service.GetPricePerBoardAsync(99)
        );

        Assert.Equal(404, ex.StatusCode);
    }
}
