-----------------------------------------------------------
-- BASE SCHEMA
-----------------------------------------------------------
drop schema if exists deadpigeons cascade;
create schema if not exists deadpigeons;

-----------------------------------------------------------
-- ADMINS (Login)
-----------------------------------------------------------
create table deadpigeons.admin (
                                   id          text primary key,
                                   email       text unique not null,
                                   password    text not null,      -- hashed
                                   createdAt   timestamptz not null default now()
);

-----------------------------------------------------------
-- PLAYERS (Login + Profile + Balance)
-----------------------------------------------------------
create table deadpigeons.player (
                                    id          text primary key,
                                    email       text unique not null,
                                    password    text not null,      -- hashed
                                    fullName    text not null,
                                    phone       text,
                                    active      boolean not null default false,
                                    balance     int not null default 0,   -- DKK
                                    createdAt   timestamptz not null default now()
);

-----------------------------------------------------------
-- WEEKLY GAMES (Rounds)
-----------------------------------------------------------
create table deadpigeons.game (
                                  id             text primary key,
                                  year           int not null,
                                  weekNumber     int not null,
                                  startAt        timestamptz,
                                  joinDeadline   timestamptz,
                                  winningNumbers int[],                 -- exactly 3 ints (1–16)
                                  createdAt      timestamptz default now()
);

create index game_week_idx on deadpigeons.game(year, weekNumber);

-----------------------------------------------------------
-- BOARD PRICES (Static)
-----------------------------------------------------------
create table deadpigeons.boardprice (
                                        fieldsCount int primary key,
                                        price       int not null
);

insert into deadpigeons.boardprice(fieldsCount, price) values
                                                           (5, 20),
                                                           (6, 40),
                                                           (7, 80),
                                                           (8, 160);

-----------------------------------------------------------
-- BOARDS (Player Guesses)
-----------------------------------------------------------
create table deadpigeons.board (
                                   id         text primary key,
                                   playerId   text references deadpigeons.player(id)
                                       on delete cascade,
                                   gameId     text references deadpigeons.game(id)
                                       on delete cascade,
                                   numbers    int[] not null,            -- 5–8 numbers (1–16)
                                   price      int not null,              -- from boardprice
                                   repeatId   text,
                                   createdAt  timestamptz default now()
);

create index board_game_idx on deadpigeons.board(gameId);
create index board_player_idx on deadpigeons.board(playerId);

-----------------------------------------------------------
-- REPEATING BOARDS (Subscriptions)
-----------------------------------------------------------
create table deadpigeons.repeat (
                                    id             text primary key,
                                    playerId       text references deadpigeons.player(id)
                                        on delete cascade,
                                    numbers        int[] not null,       -- 5–8 numbers
                                    price          int not null,
                                    remainingWeeks int not null,
                                    optOut         boolean not null default false,
                                    createdAt      timestamptz default now()
);

-----------------------------------------------------------
-- TRANSACTIONS (Ledger)
-- Deposits, purchases, refunds, MobilePay logs
-----------------------------------------------------------
create table deadpigeons.transaction (
                                         id           text primary key,
                                         playerId     text references deadpigeons.player(id)
                                             on delete cascade,
                                         type         text not null
                                             check (type in ('deposit','purchase','refund')),
                                         amount       int not null,            -- + deposit, - purchase
                                         mobilePayRef text,
                                         status       text not null default 'pending'
                                             check (status in ('pending','approved','rejected')),
                                         boardId      text references deadpigeons.board(id)
                                                               on delete set null,
                                         createdAt    timestamptz default now(),

    -- Changed from referencing user_account → now referencing admin
                                         processedBy  text references deadpigeons.admin(id),
                                         processedAt  timestamptz
);

create index transaction_player_idx on deadpigeons.transaction(playerId);
create index transaction_status_idx on deadpigeons.transaction(status);
create index transaction_mobilepay_idx on deadpigeons.transaction(mobilePayRef);