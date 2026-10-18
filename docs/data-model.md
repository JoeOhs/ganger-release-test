# Data model

The app keeps everything in IndexedDB, through Dexie, on this computer. The schema lives in `src/db/schema.ts`. The data model has one entity, because the day-one features only need one.

## Book

A Book is one entry on the reading list. It stores the title and author the person typed when adding the book (MH-1), so the list can show what each book is. It also stores `isRead`, which is true once the person has marked the book as read, and `readAt`, the time that happened, which is empty while the book is unread (MH-2). `addedAt` records when the book joined the list, and the list is ordered by it. The `id` is an auto-incremented key assigned by IndexedDB, so no two books share one. The `title`, `author` and `addedAt` fields are indexed for lookup and ordering; `isRead` is filtered in code because IndexedDB cannot index boolean values.
