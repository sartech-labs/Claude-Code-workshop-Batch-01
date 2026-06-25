// .claude/hooks/block-rm.js
// This script is a "hook" - Claude Code runs it automatically before executing a command,
// and uses its exit code to decide whether to allow or block that command.

// This array will collect the raw pieces of data sent to this script over stdin (standard input).
const chunks = [];
// Every time a new piece of input data arrives, add it to the chunks array.
process.stdin.on('data', d => chunks.push(d));
// Once all the input has finished arriving, run this function.
process.stdin.on('end', () => {
  // Combine all the chunks into one piece of text, then parse it as JSON
  // (Claude Code sends details about the command as a JSON object).
  const input = JSON.parse(Buffer.concat(chunks).toString());
  // Pull out the actual shell command Claude wants to run; default to an empty string if missing.
  const command = input?.tool_input?.command || '';

  // Block ALL destructive delete commands across bash AND powershell
  // This is a list of regular expressions (patterns) used to detect dangerous delete commands.
  const blocked = [
    /rm\s+-rf/,    // matches "rm -rf" (force-deletes folders/files), e.g. "rm -rf"
    /rm\s+/,       // matches any "rm " command (delete files on Mac/Linux/bash)
    /Remove-Item/i, // matches PowerShell's "Remove-Item" command, ignoring uppercase/lowercase
    /del\s+/i,     // matches Windows "del " command, ignoring uppercase/lowercase
    /rmdir/i,      // matches "rmdir" (remove directory), ignoring uppercase/lowercase
    /rd\s+/i,      // matches "rd " (shorthand for rmdir on Windows), ignoring uppercase/lowercase
  ];

  // Check if the command matches any of the blocked patterns above.
  if (blocked.some(pattern => pattern.test(command))) {
    // Print an error message that Claude Code will show to explain why it was blocked.
    process.stderr.write('BLOCKED: Delete commands are not allowed.\n');
    // Exit with code 2 - by convention, this tells Claude Code "block this command".
    process.exit(2);  // <-- this is what actually blocks it
  }

  // If no dangerous pattern matched, exit with code 0 - meaning "allow this command".
  process.exit(0);
});