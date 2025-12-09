using System.ComponentModel.DataAnnotations;
using System.Text;
using api;
using api.security;
using api.Services;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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

// Authentication & Authorization
builder
    .Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme             = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultSignInScheme       = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = JwtService.ValidationParameters(builder.Configuration);

        // Optional: debug logs
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"JWT auth failed: {context.Exception}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("JWT token validated");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    // Policies for convenience
    options.AddPolicy("AdminOnly",
        policy => policy.RequireClaim("role", "1"));

    options.AddPolicy("PlayerOnly",
        policy => policy.RequireClaim("role", "2"));
});


// =======================
// Services (FULL SET!)
// =======================
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<IBoardPriceService, BoardPriceService>();
builder.Services.AddScoped<ITokenService, JwtService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IAuthService, AuthService>();

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
if (!app.Environment.IsProduction())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

// IMPORTANT — must be AFTER Swagger is configured
app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts")
   .GetAwaiter()
   .GetResult();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
