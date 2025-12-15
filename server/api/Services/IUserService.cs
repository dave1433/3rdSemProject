using api.dtos.Requests;
using api.dtos.Responses;
using System.Security.Claims;

namespace api.Services;

public interface IUserService
{
    Task<UserResponse> CreateUserAsync(CreateUserRequest request);
    Task<List<UserResponse>> GetAllUsersAsync();
    Task<UserResponse?> GetByIdAsync(string id);
    Task<UserResponse?> GetCurrentAsync(ClaimsPrincipal principal);
    Task<bool> ActivateAsync(string id);
    Task<bool> DeactivateAsync(string id);
}