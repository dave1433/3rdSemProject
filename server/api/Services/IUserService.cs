using api.dtos.Requests;
using api.dtos.Responses;
using System.Security.Claims;
using Sieve.Models;

namespace api.Services;

public interface IUserService
{
    Task<UserResponse> CreateUserAsync(CreateUserRequest request);
    Task<List<UserResponse>> GetAllUsersAsync();
    Task<List<UserResponse>> GetAllUsersAsync(string? q, SieveModel sieveModel);
    Task<UserResponse?> GetByIdAsync(string id);
    Task<UserResponse?> GetCurrentAsync(ClaimsPrincipal principal);
    Task<bool> ActivateAsync(string id);
    Task<bool> DeactivateAsync(string id);
}