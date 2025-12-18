namespace api.Errors;

public static class ApiErrors
{
    public static ApiException BadRequest(string message)
        => new(400, "BAD_REQUEST", message);

    public static ApiException Unauthorized(string message)
        => new(401, "UNAUTHORIZED", message);

    public static ApiException Forbidden(string message)
        => new(403, "FORBIDDEN", message);

    public static ApiException NotFound(string message)
        => new(404, "NOT_FOUND", message);

    public static ApiException Conflict(string message)
        => new(409, "CONFLICT", message);
}