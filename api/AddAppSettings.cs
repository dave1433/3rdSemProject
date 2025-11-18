using System.ComponentModel.DataAnnotations;

namespace api;

public static class AppSettingsExtensions
{
    public static AppSettings AddAppSettings(this IServiceCollection services, IConfiguration configuration)
    {
        var appSettings = new AppSettings();
        configuration.GetSection(nameof(AppSettings)).Bind(appSettings);

        services.Configure<AppSettings>(configuration.GetSection(nameof(AppSettings)));

        ICollection<ValidationResult> results = new List<ValidationResult>();
        var validated = Validator.TryValidateObject(appSettings, new ValidationContext(appSettings), results, true);
        if (!validated)
            throw new Exception(
                $"hey buddy, alex here. You're probably missing an environment variable / appsettings.json stuff / repo secret on github. Here's the technical error: " +
                $"{string.Join(", ", results.Select(r => r.ErrorMessage))}");

        return appSettings;
    }
}