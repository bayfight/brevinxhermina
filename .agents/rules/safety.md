# Safety Rules

These rules define boundaries to protect the project configuration, user secrets, and deployment stability.

## Secret Handling
* **Do not read, print, copy, or modify `.env`, `.env.local`, service account JSON files, private keys, tokens, or credentials unless the user explicitly asks.**
* Do not introduce secrets (passwords, keys, tokens) into tracked files, documentation, or commits.

## Deployment Safety
* **Do not run production deploy commands without explicit user approval.**
* Do not deploy Firestore rules, Storage rules, or indexes without explicit approval.

## State and File Deletion
* Do not delete files, reset git state, or overwrite broad areas of the project without explaining the impact first.
* Treat `docs/archive/` as historical reference. Do not use archived docs as the source of truth when active docs exist.
