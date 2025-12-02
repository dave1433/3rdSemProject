using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class User
{
    public string Id { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Fullname { get; set; } = null!;

    public string? Phone { get; set; }

    public int Role { get; set; }

    public bool Active { get; set; }

    public int Balance { get; set; }

    public DateTime Createdat { get; set; }

    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    public virtual ICollection<Player> Players { get; set; } = new List<Player>();

    public virtual ICollection<Repeat> Repeats { get; set; } = new List<Repeat>();

    public virtual ICollection<Transaction> TransactionPlayers { get; set; } = new List<Transaction>();

    public virtual ICollection<Transaction> TransactionProcessedbyNavigations { get; set; } = new List<Transaction>();
}
