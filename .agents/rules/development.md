# Development Rules

These rules guide coding practices, workflow steps, verification procedures, and token usage optimization.

## Communication
* **Respond to the user in Bahasa Indonesia unless they ask for another language.**
* Keep responses practical, concise, and action-oriented.
* Explain risky operations before doing them.

## Token Optimization (RTK Command Executions)
* **Gunakan utilitas `rtk` (Rust Token Killer) saat menjalankan perintah terminal yang berpotensi menghasilkan output besar** (seperti `yarn build`, `yarn lint`, `git diff`, `git status`, `git log`).
* Tambahkan prefix `rtk` di depan perintah CLI yang ingin Anda jalankan (contoh: `rtk yarn build` atau `rtk yarn lint`).
* Ini bertujuan untuk mengompresi dan memfilter output terminal sebelum dikirim kembali ke agen, menghemat 60-90% penggunaan token konteks Anda.

## Workflow
* Read the relevant files before editing.
* Follow the existing project structure and naming patterns.
* Keep changes scoped strictly to the user request.
* Prefer updating documentation when code behavior, Firebase schema, upload paths, or deployment steps change.
* Use `rg` or `find` for project searches.
* Use correct file replacement tools (like `replace_file_content` or `multi_replace_file_content`) for file edits.

## Verification
* For documentation-only changes, verify links/paths and scan for stale references.
* For application code changes, run the smallest useful verification first.
* Use `yarn build` (prefixed with `rtk` where possible, e.g. `rtk yarn build`) for larger app changes.
* `yarn lint` is listed in `package.json`, but confirm it works in this Next.js version before relying on it.

## Project Structure
* `app/`: Next.js App Router pages, layouts, API routes, and Server Actions.
* `components/`: React components grouped by feature.
* `components/providers/`: React providers and app-level context.
* `lib/`: Firebase, auth, authorization, storage, and export utilities.
* `types/`: shared TypeScript models.
* `docs/codex/`: AI/project execution context.
* `docs/archive/`: old documentation kept for history.
