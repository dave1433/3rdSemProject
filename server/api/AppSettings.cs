using System.ComponentModel.DataAnnotations;

namespace api;

public class AppSettings
{
    [MinLength(1)]
    public string DefaultConnection { get; set; }
    [MinLength(1)]
    public string Secret { get; set; }
}