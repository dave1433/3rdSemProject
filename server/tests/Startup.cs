using Microsoft.Extensions.DependencyInjection;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Intentionally minimal.
        // Database is provided by PostgresFixture (Testcontainers),
        // not via appsettings or static connection strings.

        // Example: shared utilities could go here if needed later
        // services.AddSingleton<ISomeService, SomeService>();
    }
}