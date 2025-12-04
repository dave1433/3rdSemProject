using api.DTOs.Responses;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Postgres.Scaffolding; 

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardPriceController : ControllerBase
{
    private readonly IBoardPriceService _service;

    public BoardPriceController(IBoardPriceService service)
    {
        _service = service;
    }

    // GET /api/BoardPrice
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BoardPriceDtoResponse>>> GetAll()
    {
        var entities = await _service.GetAllAsync();
        var dtos = entities.Select(bp => new BoardPriceDtoResponse(bp)).ToList();
        return Ok(dtos);
    }
}