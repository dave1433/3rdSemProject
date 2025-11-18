using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class Game
{
    public string Id { get; set; } = null!;

    public int Year { get; set; }

    public int Weeknumber { get; set; }

    public DateTime? Startat { get; set; }

    public DateTime? Joindeadline { get; set; }

    public List<int>? Winningnumbers { get; set; }

    public DateTime? Createdat { get; set; }

    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();
}
