using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class Player
{
    public string Id { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Userid { get; set; } = null!;

    public string Fullname { get; set; } = null!;

    public bool Active { get; set; }

    public int Balance { get; set; }

    public DateTime Createdat { get; set; }

    public virtual User User { get; set; } = null!;
}
