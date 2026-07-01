# Committee Tracker (React)

A React + Vite conversion of the original vanilla HTML/CSS/JS committee tracker.

## Project structure

```
committee-tracker/
├── index.html                  # Vite entry HTML (just a <div id="root">)
├── public/
│   └── icon.png                 # favicon / app icon
├── src/
│   ├── main.jsx                 # mounts <App /> into #root
│   ├── App.jsx                  # top-level state + layout
│   ├── App.css                  # all styles, ported 1:1 from the original <style> block
│   ├── constants.js              # DAILY_AMOUNT, DURATION, MEMBER_TOTAL_SLOTS, etc.
│   ├── hooks/
│   │   └── useLocalStorage.js    # useState that syncs to localStorage
│   ├── utils/
│   │   ├── dateHelpers.js        # formatDateMobile, formatDateToInput, isDateSkipped
│   │   └── committeeEngine.js    # pure function that builds the 13-cycle timeline
│   └── components/
│       ├── StatsPanel.jsx        # top 3 stat cards
│       ├── Checklist.jsx         # daily checkbox grid + "manage skipped" view
│       ├── CommitteeTable.jsx    # schedule table (assign/date/notes)
│       ├── EditableDate.jsx      # double-click-to-edit date cell
│       ├── EditableNote.jsx      # click-to-add / double-click-to-edit note cell
│       └── Pagination.jsx        # prev/next footer
```

## Run it

```bash
npm install
npm run dev       # starts a local dev server, usually http://localhost:5173
```

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## What changed from the original vanilla JS version

The original `script.js` did everything by hand: it queried the DOM with
`getElementById`, rebuilt `innerHTML` strings, and — whenever a date changed —
called `window.location.reload()` to force the whole timeline-generation loop
to run again from scratch.

React replaces that pattern with:

- **State instead of DOM writes.** Every piece of data that used to live in a
  module-level variable (`savedAllocations`, `savedNotes`, `manualDates`,
  `savedChecklists`, `globalSkippedDates`) is now `useState`, wrapped in a
  small `useLocalStorage` hook so it still persists automatically.
- **A pure calculation function instead of a page reload.** `buildCommittees()`
  in `utils/committeeEngine.js` is the same date-sequencing loop from the
  original file, just extracted into a function with no side effects. It's
  wrapped in `useMemo` in `App.jsx`, so it re-runs automatically whenever
  `manualDates` or `globalSkippedDates` change — no reload needed.
- **Components instead of `innerHTML` templates.** Each visual piece
  (the stat cards, the checklist grid, the table, the editable cells) is now
  a small component that receives data as props and calls a callback prop
  when the user does something, instead of manually re-rendering HTML
  strings and re-attaching event listeners.

The visual design, class names, and CSS are intentionally unchanged so the
app looks identical to the original.
