using api.dtos.Requests;
using api.dtos.Responses;
using api.security;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, ITokenService tokenService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<JwtResponse>> Login([FromBody] AuthRequest request)
    {
        var userInfo = await authService.AuthenticateAsync(request);
        var token    = tokenService.CreateToken(userInfo);
        
        var response = new JwtResponse(
            Token:  token,
            Role:   userInfo.Role,
            UserId: userInfo.Id);
            
            return Ok(response);
    }

    [HttpGet("userinfo")]
    [Authorize]
    public async Task<ActionResult<AuthUserInfo?>> UserInfo()
    {
        var info = await authService.GetUserInfoAsync(User);
        return Ok(info);
    }
}