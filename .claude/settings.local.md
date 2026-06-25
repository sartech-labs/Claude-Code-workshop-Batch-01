# What does `settings.local.json` do?

This file configures how Claude Code behaves in this project. It's plain JSON,
so it can't contain `//` comments without breaking — this file explains it
line by line instead.

```json
{
  "hooks": {
    "PreToolUse": [
```
- `hooks` lets you run your own scripts automatically around Claude's actions.
- `PreToolUse` means "run this *before* Claude uses a tool" (as opposed to
  `PostToolUse`, which would run *after*).

```json
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.js"
          }
        ]
      }
```
- `matcher: "Bash"` means this hook only triggers when Claude is about to run
  a `Bash` (shell/terminal) command — not for other tools like file edits.
- `command` is the script that actually runs: it starts `node` (Node.js) and
  runs `block-rm.js`, a script that inspects the command Claude is about to
  run and can block it (see that file's own comments for how).
- `${CLAUDE_PROJECT_DIR}` is a variable Claude Code fills in automatically
  with this project's folder path, so the hook works no matter where the
  project is located on disk.

```json
  "permissions": {
    "allow": [
      "mcp__supabase__list_tables",
      "mcp__supabase__get_publishable_keys",
      "mcp__supabase__get_project_url",
      "Bash(git add *)",
      "Bash(git commit -m ' *)"
    ],
```
- `permissions.allow` is a list of actions Claude is allowed to run
  *without asking you first*.
- `mcp__supabase__list_tables`, `mcp__supabase__get_publishable_keys`,
  `mcp__supabase__get_project_url` — read-only Supabase lookups (list
  database tables, get API keys/URL) that are safe to run automatically.
- `"Bash(git add *)"` — lets Claude stage any files with `git add` without
  asking. The `*` is a wildcard meaning "any arguments after `git add`".
- `"Bash(git commit -m ' *)"` — lets Claude commit with a `-m` message
  without asking, as long as the command matches this pattern.

```json
    "deny": [
      "Bash(rm *)",
      "Bash(rm -rf *)",
      "Bash(Remove-Item *)",
      "Bash(rmdir *)",
      "Bash(del *)"
    ]
  },
```
- `permissions.deny` is a list of actions Claude is **never** allowed to run,
  even if you would normally approve it. This is a second layer of safety on
  top of the `block-rm.js` hook above.
- Each entry blocks a different way of deleting files/folders:
  - `rm *` / `rm -rf *` — Mac/Linux delete commands (the `-rf` version force-
    deletes folders too, which is especially dangerous).
  - `Remove-Item *` — the PowerShell (Windows) equivalent of delete.
  - `rmdir *` — removes a directory (Mac/Linux/Windows).
  - `del *` — Windows Command Prompt's delete command.

```json
  "enabledMcpjsonServers": [
    "supabase"
  ]
}
```
- `enabledMcpjsonServers` lists which MCP (Model Context Protocol) servers
  from `.mcp.json` are turned on for this project. Here, only the
  `supabase` server is enabled, giving Claude access to Supabase-specific
  tools (like the ones listed under `allow` above).
