using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using efscaffold.Entities;

namespace Infrastructure.Postgres.Scaffolding;

public partial class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Board> Boards { get; set; }

    public virtual DbSet<Boardprice> Boardprices { get; set; }

    public virtual DbSet<Game> Games { get; set; }

   // public virtual DbSet<Player> Players { get; set; }

    public virtual DbSet<Repeat> Repeats { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Board>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("board_pkey");

            entity.ToTable("board", "deadpigeons");

            entity.HasIndex(e => e.Gameid, "board_game_idx");

            entity.HasIndex(e => e.Playerid, "board_player_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("now()")
                .HasColumnName("createdat");
            entity.Property(e => e.Gameid).HasColumnName("gameid");
            entity.Property(e => e.Numbers).HasColumnName("numbers");
            entity.Property(e => e.Playerid).HasColumnName("playerid");
            entity.Property(e => e.Price).HasColumnName("price");
            entity.Property(e => e.Repeatid).HasColumnName("repeatid");
            entity.Property(e => e.Times)
                .HasDefaultValue(1)
                .HasColumnName("times");

            entity.HasOne(d => d.Game).WithMany(p => p.Boards)
                .HasForeignKey(d => d.Gameid)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("board_gameid_fkey");

            entity.HasOne(d => d.Player).WithMany(p => p.Boards)
                .HasForeignKey(d => d.Playerid)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("board_playerid_fkey");
        });

        modelBuilder.Entity<Boardprice>(entity =>
        {
            entity.HasKey(e => e.Fieldscount).HasName("boardprice_pkey");

            entity.ToTable("boardprice", "deadpigeons");

            entity.Property(e => e.Fieldscount)
                .ValueGeneratedNever()
                .HasColumnName("fieldscount");
            entity.Property(e => e.Price).HasColumnName("price");
        });

        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("game_pkey");

            entity.ToTable("game", "deadpigeons");

            entity.HasIndex(e => new { e.Year, e.Weeknumber }, "game_week_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("now()")
                .HasColumnName("createdat");
            entity.Property(e => e.Joindeadline).HasColumnName("joindeadline");
            entity.Property(e => e.Startat).HasColumnName("startat");
            entity.Property(e => e.Weeknumber).HasColumnName("weeknumber");
            entity.Property(e => e.Winningnumbers).HasColumnName("winningnumbers");
            entity.Property(e => e.Year).HasColumnName("year");
        });

        /*modelBuilder.Entity<Player>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("player_pkey");

            entity.ToTable("player", "deadpigeons");

            entity.HasIndex(e => e.Email, "player_email_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Active)
                .HasDefaultValue(false)
                .HasColumnName("active");
            entity.Property(e => e.Balance)
                .HasDefaultValue(0)
                .HasColumnName("balance");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("now()")
                .HasColumnName("createdat");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Fullname).HasColumnName("fullname");
            entity.Property(e => e.Userid).HasColumnName("userid");

            entity.HasOne(d => d.User).WithMany(p => p.Players)
                .HasForeignKey(d => d.Userid)
                .HasConstraintName("player_userid_fkey");
        });*/

        modelBuilder.Entity<Repeat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("repeat_pkey");

            entity.ToTable("repeat", "deadpigeons");

            entity.HasIndex(e => e.Playerid, "repeat_player_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("now()")
                .HasColumnName("createdat");
            entity.Property(e => e.Numbers).HasColumnName("numbers");
            entity.Property(e => e.Optout)
                .HasDefaultValue(false)
                .HasColumnName("optout");
            entity.Property(e => e.Playerid).HasColumnName("playerid");
            entity.Property(e => e.Price).HasColumnName("price");
            entity.Property(e => e.Remainingweeks).HasColumnName("remainingweeks");

            entity.HasOne(d => d.Player).WithMany(p => p.Repeats)
                .HasForeignKey(d => d.Playerid)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("repeat_playerid_fkey");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("transaction_pkey");

            entity.ToTable("transaction", "deadpigeons");

            entity.HasIndex(e => e.Mobilepayref, "transaction_mobilepay_idx");

            entity.HasIndex(e => e.Playerid, "transaction_player_idx");

            entity.HasIndex(e => e.Status, "transaction_status_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Amount).HasColumnName("amount");
            entity.Property(e => e.Boardid).HasColumnName("boardid");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("now()")
                .HasColumnName("createdat");
            entity.Property(e => e.Mobilepayref).HasColumnName("mobilepayref");
            entity.Property(e => e.Playerid).HasColumnName("playerid");
            entity.Property(e => e.Processedat).HasColumnName("processedat");
            entity.Property(e => e.Processedby).HasColumnName("processedby");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'pending'::text")
                .HasColumnName("status");
            entity.Property(e => e.Type).HasColumnName("type");

            entity.HasOne(d => d.Board).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.Boardid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transaction_boardid_fkey");

            entity.HasOne(d => d.Player).WithMany(p => p.TransactionPlayers)
                .HasForeignKey(d => d.Playerid)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("transaction_playerid_fkey");

            entity.HasOne(d => d.ProcessedbyNavigation).WithMany(p => p.TransactionProcessedbyNavigations)
                .HasForeignKey(d => d.Processedby)
                .HasConstraintName("transaction_processedby_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_pkey");

            entity.ToTable("user", "deadpigeons");

            entity.HasIndex(e => e.Email, "user_email_key").IsUnique();

            entity.HasIndex(e => e.Role, "user_role_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Active)
                .HasDefaultValue(false)
                .HasColumnName("active");
            entity.Property(e => e.Balance)
                .HasDefaultValue(0)
                .HasColumnName("balance");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("now()")
                .HasColumnName("createdat");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Fullname).HasColumnName("fullname");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.Role).HasColumnName("role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
