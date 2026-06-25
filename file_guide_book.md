# Workshop File Guide Book

This file explains the purpose of each file in the `.claude` folder.

## 1. `.claude/settings.local.json` — the json file have the claude setting for this project

This file has the actual settings that Claude Code reads. It is a JSON file, so it can't have comments inside it. Instead, the explanations are in this companion `.md` file.

## 2. `.claude/settings.local.md` — This document explains about the settings in `.claude/settings.local.json`

This is a plain-English explanation of `.claude/settings.local.json` (the
actual config file Claude Code reads). It can't live as comments inside the
JSON itself, since JSON doesn't support comments, so it's kept as a
companion `.md` file instead.

It covers three settings:

- **`hooks.PreToolUse`** — registers a hook that runs *before* Claude
  executes a `Bash` command. The hook is `block-rm.js` (see below), invoked
  via `node ${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.js`.
- **`permissions.allow`** — a list of actions Claude can run without asking
  the user first: a few read-only Supabase MCP lookups (`list_tables`,
  `get_publishable_keys`, `get_project_url`), plus `git add` and
  `git commit -m '...'`.
- **`permissions.deny`** — a hard blocklist of delete-style commands
  (`rm`, `rm -rf`, `Remove-Item`, `rmdir`, `del`) that Claude can never run,
  even if the user would otherwise approve them. This is a second,
  independent safety net on top of the hook.
- **`enabledMcpjsonServers`** — turns on the `supabase` MCP server defined
  in `.mcp.json`, which is what makes the Supabase tools above available.

## 2. `.claude/hooks/block-rm.js` — the enforcement script

This is the actual script that `PreToolUse` runs before every `Bash`
command. It works like this:

1. Claude Code sends details about the pending command to this script over
   stdin, as JSON (e.g. `{ tool_input: { command: "rm -rf foo" } }`).
2. The script reads and parses that JSON, pulling out the `command` string.
3. It checks the command against a list of regex patterns that match
   destructive delete commands across both bash and PowerShell:
   - `rm -rf`, `rm ` (Mac/Linux/Git Bash)
   - `Remove-Item` (PowerShell)
   - `del ` (Windows cmd)
   - `rmdir`, `rd ` (Windows/Unix remove-directory)
4. **If a match is found:** it writes an error message to stderr and exits
   with code `2`. Exit code `2` is the convention Claude Code uses to mean
   "block this tool call" — so the command never runs.
5. **If no match is found:** it exits with code `0`, meaning "allow this
   command" — Claude Code proceeds normally.

## Why two layers?

- `block-rm.js` catches dangerous commands dynamically, by inspecting the
  actual command text Claude is about to run (covers any phrasing/casing).
- `permissions.deny` in settings is a static, glob-based backstop that
  blocks the same command families even if the hook were ever
  misconfigured or removed.

Together, they mean Claude Code in this project cannot delete files or
directories via shell commands, on either bash or PowerShell syntax.
