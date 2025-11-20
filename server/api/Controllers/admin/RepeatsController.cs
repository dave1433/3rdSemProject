using Microsoft.AspNetCore.Mvc;
using api.Dtos.Requests;
using api.Dtos.Responses;
using api.Services;

namespace api.Controllers.Admin;

[ApiController]
[Route("api/admin/repeats")]
public class RepeatsController : ControllerBase
{
    private readonly IRepeatService _service;

    public RepeatsController(IRepeatService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RepeatResponse>>> GetAll()
        => Ok(await _service.GetAllRepeats());

    [HttpGet("{id}")]
    public async Task<ActionResult<RepeatResponse>> GetById(string id)
    {
        var repeat = await _service.GetRepeatById(id);
        return repeat == null ? NotFound() : Ok(repeat);
    }

    [HttpPost]
    public async Task<ActionResult<RepeatResponse>> Create(CreateRepeatDto dto)
    {
        var repeat = await _service.CreateRepeat(dto);
        return CreatedAtAction(nameof(GetById), new { id = repeat.Id }, repeat);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RepeatResponse>> Update(string id, UpdateRepeatDto dto)
    {
        var updated = await _service.UpdateRepeat(id, dto);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var ok = await _service.DeleteRepeat(id);
        return ok ? NoContent() : NotFound();
    }
}