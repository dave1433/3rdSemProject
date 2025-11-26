using api;
using api.security;        // ✅ ADD THIS
using efscaffold;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);



// Load AppSettings
var appSettings = builder.Services.AddAppSettings(builder.Configuration);

// Register EF Core + PostgreSQL
builder.Services.AddDbContext<MyDbContext>(options =>
{
    options.UseNpgsql(appSettings.DefaultConnection);
});

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "DeadPigeons API";
    config.Description = "3rd Semester Project API documentation";
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseCors("AllowFrontend");
app.MapControllers();
app.Run();