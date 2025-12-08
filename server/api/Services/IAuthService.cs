using System.Security.Claims;
using api.dtos.Requests;
using api.dtos.Responses;
using api.security;

namespace api.Services;

public interface IAuthService
{
    Task<AuthUserInfo> AuthenticateAsync(AuthRequest request);
    Task<AuthUserInfo?> GetUserInfoAsync(ClaimsPrincipal principal);
}