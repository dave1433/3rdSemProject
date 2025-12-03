using System.ComponentModel.DataAnnotations;
using api;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// =======================
// AppSettings
// =======================
builder.Services.AddSingleton<AppSettings>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var settings = config
                       .GetSection(nameof(AppSettings))
                       .Get<AppSettings>()
                   ?? throw new Exception("AppSettings missing");

    Validator.ValidateObject(
        settings,
        new ValidationContext(settings),
        validateAllProperties: true
    );

    return settings;
});

// =======================
// Database
// =======================
builder.Services.AddDbContext<MyDbContext>((sp, options) =>
{
    var appSettings = sp.GetRequiredService<AppSettings>();
    options.UseNpgsql(appSettings.DefaultConnection);
});

// =======================
// Controllers
// =======================
builder.Services.AddControllers();

// =======================
// CORS
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://deadpigeons-frontend.fly.dev"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// =======================
// Swagger
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(c => c.Title = "DeadPigeons API");

var app = builder.Build();

// =======================
// Middleware order
// =======================
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthorization();

if (!app.Environment.IsProduction())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.MapControllers();
app.Run();