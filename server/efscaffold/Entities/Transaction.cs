using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class Transaction
{
    public string Id { get; set; } = null!;

    public string? Playerid { get; set; }

    public string Type { get; set; } = null!;

    public int Amount { get; set; }

    public string? Mobilepayref { get; set; }

    public string Status { get; set; } = null!;

    public string? Boardid { get; set; }

    public DateTime? Createdat { get; set; }

    public string? Processedby { get; set; }

    public DateTime? Processedat { get; set; }

    public virtual Board? Board { get; set; }

    public virtual Player? Player { get; set; }

    public virtual Admin? ProcessedbyNavigation { get; set; }
}
