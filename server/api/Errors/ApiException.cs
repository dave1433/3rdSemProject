namespace api.Errors;

public class ApiException : Exception
{
    public int StatusCode { get; }
    public string Code { get; }

    public ApiException(int statusCode, string code, string message)
        : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }
}