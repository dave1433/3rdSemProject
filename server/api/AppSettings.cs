// csharp
using System.ComponentModel.DataAnnotations;

namespace api;

public class AppSettings
{
    [Required]
    [MinLength(1)]
    public required string DefaultConnection { get; init; }

    [Required]
    [MinLength(1)]
    public required string JwtSecret { get; init; }
}