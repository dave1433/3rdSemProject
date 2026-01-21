
using System.ComponentModel.DataAnnotations;
using api.Errors;
using api.Etc;
using api.security;
using api.Services;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace api;

public class Startup
{
    private readonly IConfiguration _configuration;

    public Startup(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // =======================
    // Dependency Injection
    // =======================
    public void ConfigureServices(IServiceCollection services)
    {
        // AppSettings (validated)
        services.AddSingleton<AppSettings>(sp =>
        {
            var settings = _configuration
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

        // Database
        services.AddDbContext<MyDbContext>((sp, options) =>
        {
            var appSettings = sp.GetRequiredService<AppSettings>();
            options.UseNpgsql(appSettings.DefaultConnection);
        });

        // Controllers + validation behavior
        services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var firstError = context.ModelState.Values
                        .SelectMany(v => v.Errors)
                        .FirstOrDefault()?.ErrorMessage;

                    throw ApiErrors.BadRequest(firstError ?? "Invalid request");
                };
            });

        // Authentication (JWT)
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters =
                    JwtService.ValidationParameters(_configuration);
            });

        // Authorization
        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy("AdminOnly",
                policy => policy.RequireClaim("role", "1"));

            options.AddPolicy("PlayerOnly",
                policy => policy.RequireClaim("role", "2"));
        });

        // Application services (THIS IS DI)
        services.AddScoped<IBoardService, BoardService>();
        services.AddScoped<IBoardPriceService, BoardPriceService>();
        services.AddScoped<ITokenService, JwtService>();
        services.AddScoped<ITransactionService, TransactionService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IRepeatService, RepeatService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAdminGameService, AdminGameService>();
        services.AddScoped<SieveProcessor, AppSieveProcessor>();

        // CORS
        services.AddCors(options =>
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

        // Swagger
        services.AddEndpointsApiExplorer();
        services.AddOpenApiDocument(c =>
        {
            c.Title = "DeadPigeons API";
            c.Description = "3rd Semester Project API documentation";
        });
    }

    // =======================
    // Middleware pipeline
    // =======================
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseRouting();

        app.UseMiddleware<ApiExceptionMiddleware>();

        app.UseCors("AllowFrontend");

        if (!env.IsProduction())
        {
            app.UseOpenApi();
            app.UseSwaggerUi();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
