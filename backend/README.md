# Committee Tracker — Backend (Express + Mongoose)

A REST API that replaces the frontend's `localStorage` persistence with a
real database. Same data, same shape — just moved server-side.

## Project structure

```
committee-tracker-backend/
├── server.js                      # app entry point: middleware, routes, DB connect, listen
├── .env.example                   # copy to .env and fill in
└── src/
    ├── config/
    │   ├── db.js                   # mongoose.connect() wrapper
    │   └── constants.js            # DURATION, TOTAL_COMMITTEES, DEFAULT_MEMBERS
    ├── models/
    │   ├── Committee.js             # one doc per cycle: assignedTo, note, manual dates, checklist
    │   ├── Member.js                 # a person + their totalSlots
    │   └── SkippedDate.js            # a single skipped "YYYY-MM-DD"
    ├── controllers/                 # the actual business logic for each route
    │   ├── committeeController.js
    │   ├── memberController.js
    │   └── skippedDateController.js
    ├── routes/                      # maps HTTP verb + path -> controller function
    │   ├── committeeRoutes.js
    │   ├── memberRoutes.js
    │   └── skippedDateRoutes.js
    ├── middleware/
    │   ├── asyncHandler.js           # catches errors from async route handlers
    │   └── errorHandler.js           # turns thrown errors into JSON responses
    └── utils/
        └── seed.js                   # creates the 4 default members + 13 empty committees
```

## Setup

You need a MongoDB instance running somewhere — either locally (`mongod`)
or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
npm install
cp .env.example .env      # then edit MONGODB_URI if needed
npm run seed                # creates the 4 members + 13 empty committee cycles
npm run dev                  # starts the API on http://localhost:5000
```

`npm run dev` uses Node's built-in `--watch` flag, so it restarts on file
changes — no nodemon needed.

## API reference

All responses are JSON. All write endpoints expect `Content-Type: application/json`.

### Members

| Method | Path           | Body | Description |
|--------|----------------|------|--------------|
| GET    | `/api/members` | —    | List members with `name`, `totalSlots`, and a live-computed `availableSlots` |

### Committees

| Method | Path                                   | Body                                                          | Description |
|--------|-----------------------------------------|-----------------------------------------------------------------|--------------|
| GET    | `/api/committees`                       | —                                                                 | All 13 committee cycles, sorted by `committeeNo` |
| GET    | `/api/committees/:committeeNo`          | —                                                                 | One committee cycle |
| PATCH  | `/api/committees/:committeeNo`          | any of `{ assignedTo, note, manualStart, manualEnd }`             | Partial update. Assigning a member is rejected with `400` if they have no slots left |
| DELETE | `/api/committees/:committeeNo/note`     | —                                                                 | Clears the note |
| PATCH  | `/api/committees/:committeeNo/checklist`| `{ dayIndex: number, checked?: boolean }`                          | Sets (or toggles, if `checked` is omitted) one day's checkbox |

### Skipped dates

| Method | Path                          | Body                     | Description |
|--------|--------------------------------|--------------------------|--------------|
| GET    | `/api/skipped-dates`           | —                          | Array of `"YYYY-MM-DD"` strings |
| POST   | `/api/skipped-dates`           | `{ date: "YYYY-MM-DD" }`   | Adds a skipped date (no-op if already skipped) |
| DELETE | `/api/skipped-dates/:date`     | —                          | Removes a skipped date ("Undo Skip") |

## How this maps to the old localStorage keys

| localStorage key                     | Now lives in                              |
|---------------------------------------|--------------------------------------------|
| `committee_allocations`               | `Committee.assignedTo`                       |
| `committee_notes`                     | `Committee.note`                             |
| `committee_manual_dates`              | `Committee.manualStart` / `manualEnd`        |
| `committee_daily_checks`              | `Committee.checklist`                        |
| `committee_global_skipped_dates`      | `SkippedDate` collection                     |
| (hardcoded `MEMBER_TOTAL_SLOTS`)       | `Member` collection                          |

The date-sequencing math (`buildCommittees` in the frontend's
`utils/committeeEngine.js`) stays on the frontend — it's a pure calculation
based on today's date, `manualStart`/`manualEnd`, and the skipped-dates list,
so there's no need to duplicate it server-side. The backend's job is just to
persist the inputs to that calculation, plus enforce the one real business
rule: a member can't be assigned more committees than their `totalSlots`.

## Wiring up the React frontend

In the frontend project, the next step is to replace the `useLocalStorage`
calls in `App.jsx` with `fetch` calls to this API (e.g. `GET /api/committees`
on load, `PATCH /api/committees/:no` on assign/edit, etc.) — happy to write
that integration layer next if you want it.
