using api.Etc;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace tests.Fixtures;

public static class SieveTestFactory
{
    public static SieveProcessor Create()
    {
        var options = Options.Create(new SieveOptions());
        return new AppSieveProcessor(options);
    }
}