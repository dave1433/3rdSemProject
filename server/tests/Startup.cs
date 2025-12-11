using api;               // gives access to Program.ConfigureServices()
using efscaffold;        // gives access to MyDbContext
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace tests;

public class Startup
{
    private static PostgreSqlContainer? _container;

    public static void ConfigureServices(IServiceCollection services)
    {
        // Load normal API services
        Program.ConfigureServices(services);

        // Remove existing DbContext registration
        services.RemoveAll(typeof(MyDbContext));

        // Start PostgreSQL container once
        if (_container == null)
        {
            _container = new PostgreSqlBuilder()
                .WithImage("postgres:16")
                .Build();

            _container.StartAsync().GetAwaiter().GetResult();
        }

        // Replace DbContext with container database
        services.AddScoped<MyDbContext>(_ =>
        {
            var connectionString = _container!.GetConnectionString();

            var opts = new DbContextOptionsBuilder<MyDbContext>()
                .UseNpgsql(connectionString)
                .Options;

            var db = new MyDbContext(opts);
            db.Database.EnsureCreated();
            return db;
        });
    }
}