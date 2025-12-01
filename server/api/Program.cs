using System.ComponentModel.DataAnnotations;
using api;
using api.security;
using api.Services; // ✅ ADD THIS
using efscaffold;
using Microsoft.EntityFrameworkCore;

public class Program
{ 
    public static void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<AppSettings>(provider =>
        {
            var configuration = provider.GetRequiredService<IConfiguration>();

            var appSettings = configuration
                .GetSection(nameof(AppSettings))
                .Get<AppSettings>();

            if (appSettings is null)
                throw new InvalidOperationException("AppSettings section is missing in configuration.");

            return appSettings;
        });

        // DbContext using AppSettings from DI
        services.AddDbContext<MyDbContext>((sp, options) =>
        {
            var appSettings = sp.GetRequiredService<AppSettings>();
            options.UseNpgsql(appSettings.DefaultConnection);
        });

        // Controllers
        services.AddControllers();

        // CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // Swagger / OpenAPI
        services.AddEndpointsApiExplorer();
        services.AddOpenApiDocument(config =>
        {
            config.Title = "DeadPigeons API";
            config.Description = "3rd Semester Project API documentation";
        });

        // TODO: register other services here, e.g.:
        // services.AddScoped<IPlayerService, PlayerService>();
        // services.AddScoped<IGameService, GameService>();
        services.AddScoped<IBoardService, BoardService>();
        // services.AddScoped<IRepeatService, RepeatService>();
        // services.AddScoped<ITransactionService, TransactionService>();
    }

    public static void Main()
    {
        var builder = WebApplication.CreateBuilder();
        ConfigureServices(builder.Services);

        var app = builder.Build();
        
        var appSettings = app.Services.GetRequiredService<AppSettings>();
        //Trigger the DataAnnotations validations for AppSettings properties
        Validator.ValidateObject(appSettings, new ValidationContext(appSettings), validateAllProperties: true);

        if (app.Environment.IsDevelopment())
        {
            app.UseOpenApi();
            app.UseSwaggerUi();
        }

        //when using proxy, below CORs settings are not needed
        app.UseCors("AllowFrontend");
        app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts").GetAwaiter().GetResult();
        app.MapControllers();

        app.Run();
    }
}