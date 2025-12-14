-----------------------------------------------------------
-- BASE SCHEMA
-----------------------------------------------------------
drop schema if exists deadpigeons cascade;
create schema if not exists deadpigeons;


-----------------------------------------------------------
-- USERS (Admins + Players)
-----------------------------------------------------------
create table deadpigeons.user (
                                  id          text primary key,
                                  email       text unique not null,
                                  password    text not null,            -- hashed
                                  fullName    text not null,
                                  phone       text,
                                  role        int not null check (role in (1,2)),   -- 1=admin, 2=player
                                  active      boolean not null default false,
                                  balance     int not null default 0,               -- DKK
                                  createdAt   timestamptz not null default now()
);

create index user_role_idx on deadpigeons.user(role);


-----------------------------------------------------------
-- WEEKLY GAMES (Rounds)
-----------------------------------------------------------
create table deadpigeons.game (
                                  id             text primary key,
                                  year           int not null,
                                  weekNumber     int not null,
                                  startAt        timestamptz,
                                  joinDeadline   timestamptz,
                                  winningNumbers int[],                        -- exactly 3 ints (1–16)
                                  createdAt      timestamptz default now()
);

create index game_week_idx on deadpigeons.game(year, weekNumber);


-----------------------------------------------------------
-- BOARD PRICES (Static Price Table)
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
-- PLAYER BOARDS (Guesses)
-----------------------------------------------------------
create table deadpigeons.board (
                                   id         text primary key,
                                   playerId   text references deadpigeons.user(id)
                                       on delete cascade,
                                   gameId     text references deadpigeons.game(id)
                                       on delete cascade,
                                   numbers    int[] not null,           -- 5–8 numbers (1–16)
                                   price      int not null,             -- from boardprice
                                   times      int not null default 1,
                                   repeatId   text,                      -- links to repeat table
                                   createdAt  timestamptz default now(),
                                   autoRepeat boolean not null default false,
                                   iswinner  boolean not null default false
);

create index board_game_idx on deadpigeons.board(gameId);
create index board_player_idx on deadpigeons.board(playerId);


-----------------------------------------------------------
-- REPEATING BOARDS (Subscriptions)
-----------------------------------------------------------
create table deadpigeons.repeat (
                                    id             text primary key,
                                    playerId       text references deadpigeons.user(id)
                                        on delete cascade,
                                    numbers        int[] not null,        -- 5–8 numbers
                                    times          int not null default 1,
                                    price          int not null,
                                    playedWeeks    int not null,
                                    optOut         boolean not null default false,
                                    createdAt      timestamptz default now(),
                                    optoutat       timestamptz                                
);

create index repeat_player_idx on deadpigeons.repeat(playerId);


-----------------------------------------------------------
-- TRANSACTIONS (Ledger)
-- Deposits, purchases, refunds, mobilepay logs
-----------------------------------------------------------
create table deadpigeons.transaction (
                                         id           text primary key,
                                         playerId     text references deadpigeons.user(id)
                                             on delete cascade,

                                         type         text not null
                                             check (type in ('deposit','purchase','refund')),

                                         amount       int not null,                -- + deposit, - purchase
                                         mobilePayRef text,
                                         status       text not null default 'pending'
                                             check (status in ('pending','approved','rejected')),

                                         boardId      text references deadpigeons.board(id)
                                                               on delete set null,

                                         createdAt    timestamptz default now(),

    -- Admin who handled deposit/refund
                                         processedBy  text references deadpigeons.user(id),
                                         processedAt  timestamptz
);

create index transaction_player_idx on deadpigeons.transaction(playerId);
create index transaction_status_idx on deadpigeons.transaction(status);
create index transaction_mobilepay_idx on deadpigeons.transaction(mobilePayRef);