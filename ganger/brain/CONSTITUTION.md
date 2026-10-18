# Constitution

What this app is supposed to be. Written by Ganger from the brief; changed only by amendment.
Journeymen: build to this. Every must-have id below is what Ganger's checks verify against.

## Purpose
A desktop app for keeping a simple reading list of books

## Principles
- Built for: me, on my laptop (from the brief's audience)
- Nobody signs in: everything is open to whoever has the app. (from the brief's auth)
- It works fully with no connection; the network is a bonus. (from the brief's connectivity)

## Must-haves
### MH-1: add a book with its title and author
- [ ] A person using the app can: add a book with its title and author
- [ ] Ganger's coverage check finds the file and function that do it, in an app that builds, starts and has no placeholders left.

### MH-2: mark a book as read
- [ ] A person using the app can: mark a book as read
- [ ] Ganger's coverage check finds the file and function that do it, in an app that builds, starts and has no placeholders left.

## Non-goals
- (none)

## Stack
Backend: no. Desktop software keeps its work on the computer it runs on, so nothing needs a server.
Tested combination: Desktop program.
- framework: Electron + Vite + React
- styling: Tailwind CSS
- ui: shadcn/ui
- data: IndexedDB (Dexie)
- auth: none
- realtime: none
- deploy: desktop program (Export as a desktop app)
- integrations: none

## Open questions
Never resolved silently: ask the person.
- (none)

## Amendments
- v1, 2026-10-18, by Ganger: Written from the brief and the stack decision, before any journeyman ran.
