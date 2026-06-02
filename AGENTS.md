# Codex Project Instructions & Agent Guidelines

Guidelines for AI agents in this repository. Detailed modular rules are defined in the [.agents/](file:///Users/f8lp0115/Developer/project_pribadi/dhasboard_brevin/.agents) folder.

## ⚠️ CRITICAL RULES (BAHASA INDONESIA)
1. **Bahasa Indonesia:** Jawab selalu dalam Bahasa Indonesia secara ringkas & praktis, kecuali diminta lain.
2. **Secrets & Safety:** Jangan baca, cetak, salin, atau edit `.env`, `.env.local`, file service account, private key, token, atau credentials kecuali diminta eksplisit.
3. **Deployments:** Dilarang melakukan deployment produksi (Firebase rules, Storage rules, indexes, Next.js build deploys) tanpa persetujuan eksplisit.
4. **Token Saving (RTK):** Gunakan prefix `rtk` untuk menjalankan CLI dengan output besar (misal `rtk yarn build`, `rtk git diff`) agar konsumsi token hemat.

## 📁 Modular Agent Rules & Configurations
Sebelum memulai pekerjaan, baca aturan terperinci berikut sesuai kebutuhan tugas:
* **Keamanan & Secrets:** Lihat [rules/safety.md](file:///Users/f8lp0115/Developer/project_pribadi/dhasboard_brevin/.agents/rules/safety.md)
* **Standard Development & Token Saving:** Lihat [rules/development.md](file:///Users/f8lp0115/Developer/project_pribadi/dhasboard_brevin/.agents/rules/development.md)
* **Firebase, Storage, & Skema Firestore:** Lihat [rules/firebase.md](file:///Users/f8lp0115/Developer/project_pribadi/dhasboard_brevin/.agents/rules/firebase.md)
* **Optimasi Token (RTK):** Lihat [rules/rtk.md](file:///Users/f8lp0115/Developer/project_pribadi/dhasboard_brevin/.agents/rules/rtk.md)

## 🔧 Extensibility Folders
* **Custom Hooks:** [.agents/hooks/](file:///Users/f8lp0115/Developer/project_pribadi/dhasboard_brevin/.agents/hooks)
* **MCP Configurations:** [.agents/mcp/](file:///Users/f8lp0115/Developer/project_pribadi/dhasboard_brevin/.agents/mcp)

