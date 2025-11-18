drop schema if exists deadpigeons cascade;
create schema if not exists deadpigeons;

-----------------------------------------------------------
-- PLAYERS
-----------------------------------------------------------

create table deadpigeons.player
(
    id        text primary key not null,
    fullName  text             not null,
    phone     text,
    email     text,
    active    boolean          not null default false,
    balance   int              not null default 0, -- in DKK
    createdAt timestamp with time zone
);

-----------------------------------------------------------
-- GAMES (Weekly rounds)
-----------------------------------------------------------

create table deadpigeons.game
(
    id             text primary key not null,
    year           int              not null,  -- e.g. 2024
    weekNumber     int              not null,  -- 1–52
    startAt        timestamp with time zone,
    joinDeadline   timestamp with time zone,
    winningNumbers int[],                     -- length 3
    createdAt      timestamp with time zone
);

-- For quick history lookup (week + year)
create index game_week_idx on deadpigeons.game (year, weekNumber);

-----------------------------------------------------------
-- BOARD PRICES (Fixed DKK)
-----------------------------------------------------------

create table deadpigeons.boardprice
(
    fieldsCount int primary key not null, -- 5,6,7,8
    price       int              not null -- DKK
);

insert into deadpigeons.boardprice (fieldsCount, price) values
                                                            (5, 20),
                                                            (6, 40),
                                                            (7, 80),
                                                            (8, 160);

-----------------------------------------------------------
-- BOARDS (Player guesses)
-----------------------------------------------------------

create table deadpigeons.board
(
    id         text primary key not null,
    playerId   text references deadpigeons.player (id) on delete cascade,
    gameId     text references deadpigeons.game (id) on delete cascade,
    numbers    int[] not null,   -- 5–8 user-selected numbers
    price      int not null,     -- DKK
    repeatId   text,             -- optional: refers to repeating setup
    createdAt  timestamp with time zone
);

create index board_game_idx on deadpigeons.board (gameId);
create index board_player_idx on deadpigeons.board (playerId);

-----------------------------------------------------------
-- REPEATING BOARD SETUPS
-----------------------------------------------------------

create table deadpigeons.repeat
(
    id             text primary key not null,
    playerId       text references deadpigeons.player (id) on delete cascade,
    numbers        int[] not null,
    price          int not null,           -- DKK
    remainingWeeks int not null,
    optOut         boolean not null default false,
    createdAt      timestamp with time zone
);

-----------------------------------------------------------
-- TRANSACTIONS (Ledger: deposits, purchases)
-----------------------------------------------------------

create table deadpigeons.transaction
(
    id         text primary key not null,
    playerId   text references deadpigeons.player (id) on delete cascade,
    type       text not null,           -- 'deposit', 'purchase', 'refund', etc.
    amount     int  not null,           -- positive (deposit) or negative (purchase)
    boardId    text references deadpigeons.board (id) on delete set null,
    createdAt  timestamp with time zone,
    processedBy text,
    processedAt timestamp with time zone
);