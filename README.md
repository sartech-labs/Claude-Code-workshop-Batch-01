# Claude Code Workshop — Batch 01

Welcome! This repository contains the reference materials from the **Claude Code Workshop (Batch 01)** conducted by Sreehari. It is intended for participants to revisit concepts, copy working configurations, and use as a starting point for their own Claude Code projects.

---

## What This Workshop Covered

| Topic | What You Learned |
|---|---|
| **Hooks** | How to intercept Claude's tool calls with `PreToolUse` / `PostToolUse` hooks |
| **Permissions** | How to allowlist and denylist specific commands so Claude never asks (or never runs) |
| **Safety Patterns** | Two-layer defence: a dynamic hook script + a static deny list |
| **MCP Integration** | Enabling an MCP server (Supabase) and letting Claude call its tools automatically |

---

## Repository Structure

```
Claude-Code-workshop-Batch-01/
│
├── README.md                       ← You are here
├── file_guide_book.md              ← Plain-English guide to every file in this repo
│
└── .claude/                        ← Claude Code project configuration (auto-read by Claude Code)
    ├── settings.local.json         ← Hooks, permissions, and enabled MCP servers
    ├── settings.local.md           ← Line-by-line explanation of settings.local.json
    └── hooks/
        └── block-rm.js             ← PreToolUse hook that blocks destructive delete commands
```

> **Tip:** The `.claude/` folder is the magic folder — Claude Code reads it automatically when you open a project. Drop a `settings.local.json` here in any project to apply custom behaviour.

---

## Key Files Explained

### `.claude/settings.local.json`
The live configuration file Claude Code actually reads. Defines:
- A `PreToolUse` hook that runs `block-rm.js` before every Bash command
- An **allow** list (Supabase read operations, `git add`, `git commit`) — no prompt needed
- A **deny** list (`rm`, `Remove-Item`, `del`, `rmdir`) — permanently blocked

### `.claude/hooks/block-rm.js`
A Node.js script that receives every pending Bash command over stdin (as JSON), checks it against a list of destructive-delete patterns, and exits with code `2` to block or `0` to allow.

### `.claude/settings.local.md`
A human-readable, line-by-line walkthrough of `settings.local.json` — because JSON doesn't support comments.

### `file_guide_book.md`
A broader guide explaining the purpose of each file and the design rationale (why two safety layers instead of one).

---

## How to Reuse This in Your Own Project

1. Copy the `.claude/` folder into your project root.
2. Edit `.claude/settings.local.json` to add your own allow/deny rules or hook scripts.
3. Adjust or extend `.claude/hooks/block-rm.js` to intercept whichever commands matter for your project.
4. Open the project in Claude Code — the configuration is picked up automatically.

---

## Prerequisites

- [Claude Code](https://claude.ai/code) installed (`npm install -g @anthropic-ai/claude-code`)
- Node.js (for running the hook script)
- A Supabase project if you want to try the MCP integration

---

## Questions?

Reach out to the workshop organiser or open an issue in this repository.
