using api;
using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

var appSettings = builder.Services.AddAppSettings(builder.Configuration);

builder.Services.AddDbContext<MyDbContext>(conf =>
{
    conf.UseNpgsql(appSettings.DefaultConnection);
});

var app = builder.Build();

app.MapGet("/", (
    
    [FromServices]IOptionsMonitor<AppSettings> optionsMonitor, 
    [FromServices] MyDbContext dbContext) =>
{
    var newPlayer = new Player()
    {
        Id = Guid.NewGuid().ToString(),
        Fullname = "John Doe",
        Active = true,
        Balance = 100
    };
    dbContext.Players.Add(newPlayer);
    dbContext.SaveChanges();
    var objects = dbContext.Players.ToList();
    return objects;
});

app.Run();
