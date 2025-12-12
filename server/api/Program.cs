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
    var config   = sp.GetRequiredService<IConfiguration>();
    var settings = config.GetSection(nameof(AppSettings)).Get<AppSettings>()
                   ?? throw new Exception("AppSettings missing");

    Validator.ValidateObject(settings, new ValidationContext(settings), validateAllProperties: true);

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
// Authentication + JWT
// =======================
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme             = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultSignInScheme       = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = JwtService.ValidationParameters(builder.Configuration);

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"JWT auth failed: {context.Exception}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("JWT token validated (from JwtBearer)");
                return Task.CompletedTask;
            }
        };
    });

// =======================
// Authorization Policies
// =======================
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy("AdminOnly",
        policy => policy.RequireClaim("role", "1"));

    options.AddPolicy("PlayerOnly",
        policy => policy.RequireClaim("role", "2"));
});

// =======================
// Services
// =======================
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<IBoardPriceService, BoardPriceService>();
builder.Services.AddScoped<ITokenService, JwtService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRepeatService, RepeatService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAdminGameService, AdminGameService>();

// =======================
// CORS
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://deadpigeons-frontend.fly.dev"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true);
    });
});

// =======================
// Swagger / OpenAPI
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(c =>
{
    c.Title = "DeadPigeons API";
    c.Description = "3rd Semester Project API documentation";
});

var app = builder.Build();

// =======================
// Middleware Pipeline
// =======================
app.UseRouting();
app.UseCors("AllowFrontend");

if (!app.Environment.IsProduction())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

// generate client AFTER swagger loaded
app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts")
   .GetAwaiter()
   .GetResult();

app.UseAuthentication();
app.UseAuthorization();


// ============================
//  AUTH DEBUG MIDDLEWARE
// ============================
app.Use(async (context, next) =>
{
    Console.WriteLine("=== AUTH DEBUG MIDDLEWARE ===");

    Console.WriteLine("Auth Header: " + context.Request.Headers.Authorization);

    if (context.User?.Identity?.IsAuthenticated == true)
    {
        Console.WriteLine("User IS authenticated");
        foreach (var c in context.User.Claims)
            Console.WriteLine($"CLAIM -> {c.Type}: {c.Value}");
    }
    else
    {
        Console.WriteLine("User NOT authenticated");
    }

    Console.WriteLine("=== END AUTH DEBUG ===");

    await next();
});

app.MapControllers();
app.Run();
