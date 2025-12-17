using efscaffold.Entities;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace api.Etc;
public sealed class AppSieveProcessor : SieveProcessor
{
    public AppSieveProcessor(IOptions<SieveOptions> options)
        : base(options) { }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        // Transactions properties
        mapper.Property<Transaction>(t => t.Createdat).CanSort();
        mapper.Property<Transaction>(t => t.Status).CanFilter().CanSort();
        mapper.Property<Transaction>(t => t.Type).CanFilter().CanSort();
        mapper.Property<Transaction>(t => t.Amount).CanFilter().CanSort();
        return mapper;
    }
}