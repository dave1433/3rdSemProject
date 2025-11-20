using api;
using api.Mappings;
using api.Services;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Load AppSettings
var appSettings = builder.Services.AddAppSettings(builder.Configuration);

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddAutoMapper(typeof(PlayerProfile));

// Register EF Core + PostgreSQL
builder.Services.AddDbContext<MyDbContext>(options =>
{
    options.UseNpgsql(appSettings.DefaultConnection);
});

// Register services
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<IRepeatService, RepeatService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IGameService, GameService>();

// Add Controllers
builder.Services.AddControllers();

// Add NSwag
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "DeadPigeons API";
    config.Description = "3rd Semester Project API documentation";
});


// ✅ ENABLE CORS for React frontend (http://localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();


// Enable CORS BEFORE routing
app.UseCors("AllowFrontend");


// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.MapControllers();

app.Run();
