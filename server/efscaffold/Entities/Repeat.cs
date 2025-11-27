using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class Repeat
{
    public string Id { get; set; } = null!;

    public string? Playerid { get; set; }

    public List<int> Numbers { get; set; } = null!;

    public int Price { get; set; }

    public int Remainingweeks { get; set; }

    public bool Optout { get; set; }

    public DateTime? Createdat { get; set; }

    public virtual User? Player { get; set; }
}
