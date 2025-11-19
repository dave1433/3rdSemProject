using api;
using api.Mappings;
using api.Services;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Load AppSettings
var appSettings = builder.Services.AddAppSettings(builder.Configuration);

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(PlayerProfile));

// Register EF Core + PostgreSQL
builder.Services.AddDbContext<MyDbContext>(options =>
{
    options.UseNpgsql(appSettings.DefaultConnection);
});

// Register Services
builder.Services.AddScoped<IPlayerService, PlayerService>();

// Add controllers
builder.Services.AddControllers();
builder.Services.AddScoped<IGameService, GameService>();


// NSwag (instead of Swashbuckle)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "DeadPigeons API";
    config.Description = "3rd Semester Project API documentation";
});

var app = builder.Build();

// Enable NSwag UI
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();      // serve /swagger/v1/swagger.json
    app.UseSwaggerUi();    // serve Swagger UI
}

app.MapControllers();

app.Run();