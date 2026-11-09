# GameZone first-release setup and demonstration data

These files are intended for the existing GameZone repo, NOT as a standalone application.
Merge their contents into `C:\Web Pages React\Project` preserving the folder structure.
Do not replace any existing application files.

## Install dependencies (Windows Command Prompt)

From the project root, double-click `install-dependencies.cmd`, or run:

```bat
install-dependencies.cmd
```

This performs `npm install` in the root, server, and client directories.
It does not run `npm audit fix --force` or edit application code.
Some npm audit warnings may remain.

## Run the site

From the project root:

```bat
npm run dev
```

The React frontend is normally at http://localhost:5173/ and the API at http://localhost:5000/api/health.
Check the URLs printed by Vite and Express.
Stopping the development servers prevents new API requests; an already-open browser page can remain visible.

## Database scripts

Both scripts use `server/.env` via the existing `server/config/database.js`.
They check that the connected database name is exactly `Leaderboard`.
Before executing, confirm the `.env` MongoDB URI points to the correct Atlas deployment.
Both operate on the LIVE connected database, not a local temporary copy.

**Warning: clearing is destructive for everybody using the same Atlas database.**
It permanently removes ALL records from the `users`, `games`, `challenges`, and `scores` Mongoose collections, including admin accounts, test accounts, and team members' records. It does not drop the collections or indexes.
Coordinate with teammates or back up the data before using it.

### Clear ALL existing records (only when authorized)

Close the development server, open Command Prompt in project root, and run:

```bat
set CONFIRM_CLEAR=DELETE_GAMEZONE_DATA
node server/scripts/clearDatabase.js
set CONFIRM_CLEAR=
```

The script refuses to run without the exact confirmation environment variable.

### Seed an EMPTY database

Choose a new private password (12+ characters). Run from Command Prompt in the project root:

```bat
set "SEED_ADMIN_PASSWORD=ReplaceWithYourOwnStrongPassword123!"
node server/scripts/seedDatabase.js
set SEED_ADMIN_PASSWORD=
```

The seed script refuses to populate a nonempty database. It creates:

- 9 users: 8 fictional players and 1 admin
- 5 games: Space Invaders, Pac-Man, Tetris, Donkey Kong, Asteroids
- 12 challenges in total
- 96 scores: one personal-best numeric `value` per player per challenge

Admin account: `gamezoneadmin@example.com`; password: your chosen `SEED_ADMIN_PASSWORD` value.
Other demo accounts receive random passwords and are meant only as leaderboard entries.

The only score metric is `value`; there is no time-based score field.
The seed follows GameZone's unique indexes on game names, challenge names per game, and personal bests per user per challenge.

## Verify

1. In MongoDB Atlas, check document counts in the four collections (9, 5, 12, 96).
2. Start the application with `npm run dev`.
3. Browse `/games` and `/leaderboard`, select different games/challenges, and verify scores are ranked.
4. Log in as the demo administrator and check `/admin`.

## Safety and version control

Never commit `server/.env`, passwords, API keys, or other secrets.
Do not run destructive scripts against a production or shared database without agreement.
Review the changes with `git status` and `git diff` before committing these scripts;
these are demonstration utilities, not automatically run on server startup.
