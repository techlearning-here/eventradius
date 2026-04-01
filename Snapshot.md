Product: A web app where people publish events (organizers) and discover / subscribe or register for events (attendees), across event types (categories, formats, etc.—whatever your schema supports).

Stack: React (frontend), FastAPI (API), Supabase (auth, DB, storage, realtime as needed).


dev prompt  for AI: 

TDD by default (failing test first, then code); Python 3.12 + pinned deps; SQL literals single-quoted; no Supabase at import without env; isort+black; no extra docs or verbose explanations unless asked; minimal comments; no pyc in git.