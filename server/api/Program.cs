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
// ✅ CORS (PRE-FLIGHT SAFE)
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
                origin == "https://deadpigeons-frontend.fly.dev" ||
                origin == "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// =======================
// Swagger
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(c => c.Title = "DeadPigeons API");

var app = builder.Build();

// =======================
// ✅ PIPELINE (ORDER IS CRITICAL)
// =======================

app.UseRouting();

// ✅ THIS MUST BE HERE
app.UseCors("AllowFrontend");

// ✅ Because OPTIONS is not authenticated
app.UseAuthorization();

if (!app.Environment.IsProduction())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.MapControllers();

app.Run();
