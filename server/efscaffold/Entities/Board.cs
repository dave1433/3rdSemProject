using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class Board
{
    public string Id { get; set; } = null!;

    public string? Playerid { get; set; }

    public string? Gameid { get; set; }

    public List<int> Numbers { get; set; } = null!;

    public int Price { get; set; }

    public string? Repeatid { get; set; }

    public DateTime? Createdat { get; set; }

    public virtual Game? Game { get; set; }

    public virtual User? Player { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
