using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class Player
{
    public string Id { get; set; } = null!;

    public string Fullname { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public bool Active { get; set; }

    public int Balance { get; set; }

    public DateTime? Createdat { get; set; }

    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    public virtual ICollection<Repeat> Repeats { get; set; } = new List<Repeat>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
