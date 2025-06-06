# Phase 2 

Let's import a JS/TS/JSX/TSX AST parser. I'd like to say whatever eslint uses is a good one, but we can discuss.

Let's try espree first.

Given a JS file, I want to export:
```
- app/
  - api/
    - chat/
      - route.ts: POST
    - privacy/
      - page.tsx: PrivacyPolicy
    - terms/
      - page.tsx: TermsOfService
    - favicon.ico
    - globals.css
    - layout.tsx: metadata, RootLayout
    - page.tsx: Home
- components/
  - ChatInterface: ChatInterface
  - ErrorBoundary: ErrorBoundary
  - Footer: Footer
  - ParticleSystem: ParticleSystem
- docs/
  - design-document.md
  - implementation-summary.md
- lib/
  - openai.ts: sendMessageToPixel
  - types.ts: User, Message, Conversation, SharedMemoryContext, ChatState, ParticleState
  - user.ts: generateUserId, getCurrentUser, createUser, getSharedMemory, updateSharedMemory, updateUserActivity
- node_modules/ (skip)
- public/
- scripts/
  - test-ai.mjs: none
- .env.local
- .gitignore
- docs.json
...
```

It lists all files except node_modules/ stuff.
Then lists all of the exported symbols.