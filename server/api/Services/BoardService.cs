using api.dtos.Requests;
using api.dtos.Responses;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BoardService : IBoardService
{
    private readonly MyDbContext _db;

    public BoardService(MyDbContext db)
    {
        _db = db;
    }

    public async Task<List<BoardDtoResponse>> GetByUserAsync(string userId)
    {
        var boards = await _db.Boards
            .Include(b => b.Transactions)
            .Where(b => b.Playerid == userId)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards.Select(b => new BoardDtoResponse(b)).ToList();
    }
    
    public async Task<List<AdminBoardDtoResponse>> GetAllBoardsForAdminAsync()
    {
        var boards = await _db.Boards
            .Include(b => b.Player)
            .OrderByDescending(b => b.Createdat)
            .ToListAsync();

        return boards
            .Where(b => b.Player != null)
            .Select(b => new AdminBoardDtoResponse(b, b.Player))
            .ToList();
    }


    public async Task<List<BoardDtoResponse>> CreateBetsAsync(
        string userId,
        IEnumerable<CreateBoardRequest> dtos)
    {
        var list = dtos.ToList();
        if (list.Count == 0)
            return new List<BoardDtoResponse>();

        var now = DateTime.UtcNow;

        // Latest game (can be null if no game yet)
        var game = await _db.Games
            .OrderByDescending(g => g.Createdat)
            .FirstOrDefaultAsync();

        var gameId = game?.Id;

        // Use authenticated playerId, not data from the body
        var player = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (player == null)
            throw new Exception("User not found");

        var boardsToAdd = new List<Board>();
        var totalCost = 0;

        foreach (var dto in list)
        {
            var fields = dto.Numbers.Count;

            var basePrice = await _db.Boardprices
                .Where(x => x.Fieldscount == fields)
                .Select(x => (int?)x.Price)
                .SingleOrDefaultAsync();

            if (basePrice == null)
                throw new Exception($"No price found for {fields} fields.");

            var boardPrice = basePrice.Value * dto.Times;
            
            var futureTotal = boardPrice + totalCost;
            if (player.Balance - futureTotal < 0)
            {
                throw new Exception(
                    $"Insufficient balance for this bet. " +
                    $"Need {futureTotal} DKK, have {player.Balance} DKK.");
            }

            totalCost = futureTotal;

            var board = new Board
            {
                Id        = Guid.NewGuid().ToString(),
                Playerid = userId,        // ✅ authenticated user
                Gameid    = gameId,
                Numbers   = dto.Numbers,
                Times     = dto.Times,
                Price     = boardPrice,
                Createdat = now
                
            };

            boardsToAdd.Add(board);
        }

        // Validate balance
        if (player.Balance < totalCost)
            throw new Exception($"Insufficient balance: need {totalCost}, have {player.Balance}");

        // Deduct user's balance
        player.Balance -= totalCost;

        // Add purchase transactions
        foreach (var board in boardsToAdd)
        {
            _db.Transactions.Add(new Transaction
            {
                Id         = Guid.NewGuid().ToString(),
                Playerid   = userId,
                Type       = "purchase",
                Amount     = -board.Price,
                Status     = "approved",
                Boardid    = board.Id,
                Createdat  = now
            });
        }

        await _db.Boards.AddRangeAsync(boardsToAdd);
        await _db.SaveChangesAsync();

        return boardsToAdd.Select(b => new BoardDtoResponse(b)).ToList();
    }
}
