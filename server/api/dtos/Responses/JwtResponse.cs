namespace api.dtos.Responses;

public record JwtResponse(
    string Token,
    int Role,
    string UserId
);
