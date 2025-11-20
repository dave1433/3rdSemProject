// csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace api;

public static class AddAppSettingsExtensions
{
    public static AppSettings AddAppSettings(this IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection(nameof(AppSettings));
        var settings = section.Get<AppSettings>()
                       ?? throw new InvalidOperationException("Missing 'AppSettings' configuration section.");

        var results = new List<ValidationResult>();
        var valid = Validator.TryValidateObject(settings, new ValidationContext(settings), results, validateAllProperties: true);
        if (!valid)
        {
            Console.WriteLine("Warning: Invalid AppSettings configuration. Validation errors:");
            foreach (var r in results.Where(r => r != ValidationResult.Success))
                Console.WriteLine($" - {r.ErrorMessage}");
            // Continue without throwing so the application can start. Fix configuration to remove warnings.
        }

        services.Configure<AppSettings>(section);
        services.AddSingleton(settings);

        return settings;
    }
}