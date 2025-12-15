using api;
using efscaffold;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace tests;

public class Startup
{
    private readonly PostgreSqlContainer _container;

    public Startup()
    {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("testdb")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();

        _container.StartAsync().GetAwaiter().GetResult();
    }

    public void ConfigureServices(IServiceCollection services)
    {
        // Load API services (same as production)
        Program.ConfigureServices(services);

        // Remove production DbContext
        services.RemoveAll(typeof(MyDbContext));

        // Replace with Testcontainers DbContext
        services.AddDbContext<MyDbContext>(options =>
            options.UseNpgsql(_container.GetConnectionString()));

        // Ensure schema is applied
        using var scope = services.BuildServiceProvider().CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MyDbContext>();
        db.Database.Migrate();
    }
}