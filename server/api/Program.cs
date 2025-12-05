using System.ComponentModel.DataAnnotations;
using api;
using api.Services;
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
// Services (FULL SET!)
// =======================
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<IBoardPriceService, BoardPriceService>();

// ⭐ Missing from your version — needed for deposits, balance updates, approvals!
builder.Services.AddScoped<ITransactionService, TransactionService>();

// Add user/auth services if you create them:
// builder.Services.AddScoped<IUserService, UserService>();
// builder.Services.AddScoped<IAuthService, AuthService>();

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
builder.Services.AddOpenApiDocument(c =>
{
    c.Title = "DeadPigeons API";
    c.Description = "3rd Semester Project API documentation";
});

var app = builder.Build();

// =======================
// Middleware
// =======================
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthorization();

if (!app.Environment.IsProduction())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

// IMPORTANT — must be AFTER Swagger is configured
app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts")
   .GetAwaiter()
   .GetResult();

app.MapControllers();

app.Run();
