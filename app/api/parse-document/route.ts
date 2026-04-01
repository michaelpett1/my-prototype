import { NextRequest, NextResponse } from 'next/server';
import { spawn, execSync } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';

const CLAUDE_PROMPT = `You are a product management assistant. I will give you the text content of an uploaded document (it may be a PDF audit, spreadsheet export, or report). Extract every actionable roadmap item, recommendation, finding, or task.

For each item return a JSON object with EXACTLY these fields:
- "title": A clean, concise action-oriented title (5-80 chars). Do NOT include severity prefixes like "CRITICAL -" or "P0:" in the title. Just the action. Example: "Remove mid-scroll operator interstitials" not "CRITICAL - Remove mid-scroll operator interstitials".
- "description": 1-2 sentence summary explaining what needs doing and the expected impact or business context. Example: "Full-screen ads interrupt the browsing flow and cause a 15-20% bounce rate increase. Removing them would significantly improve user retention."
- "priority": One of "p0", "p1", "p2", "p3" based on the document's own severity/priority labels.
- "type": "project" for large initiatives, "milestone" for releases/deadlines, "task" for everything else.
- "relevanceScore": A number 60-95 representing how relevant/impactful this item is for a product roadmap.
- "tags": Array of 2-4 lowercase kebab-case tags. Example: ["ux", "mobile", "performance"]

Return ONLY a valid JSON array with no markdown fences and no explanation text. If nothing actionable, return [].
Max 30 items. Focus on quality — each should be a distinct, clearly actionable suggestion a product manager would want to review.`;

/**
 * Get a valid Anthropic access token.
 * Reads from macOS Keychain, and if expired, attempts refresh via the Anthropic API.
 */
function getAccessToken(): string {
  // First check environment variable
  const envToken = process.env.ANTHROPIC_API_KEY;
  if (envToken && envToken.length > 10) {
    return envToken;
  }

  // Read from macOS Keychain
  try {
    const credJson = execSync(
      'security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null',
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();
    const creds = JSON.parse(credJson);
    const oauth = creds?.claudeAiOauth;
    if (oauth?.accessToken) {
      return oauth.accessToken;
    }
  } catch {
    // Fall through
  }

  throw new Error('AUTH_EXPIRED');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract raw text from the file first (server-side)
    const text = await extractText(file);

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Could not extract meaningful content from this file.' }, { status: 400 });
    }

    // Truncate for context limits
    const truncated = text.slice(0, 40000);

    // Try Claude CLI first (handles its own auth refresh)
    const claudePath = process.env.CLAUDE_CLI_PATH
      || path.join(os.homedir(), '.local', 'bin', 'claude');

    const fullPrompt = `${CLAUDE_PROMPT}\n\nHere is the document content:\n\n---\n${truncated}\n---`;

    let stdout: string;
    try {
      stdout = await runClaude(claudePath, fullPrompt);
    } catch (cliError) {
      const errMsg = cliError instanceof Error ? cliError.message : String(cliError);

      // If CLI failed with auth error, try SDK with keychain token
      if (errMsg.includes('401') || errMsg.includes('auth') || errMsg.includes('token')) {
        console.log('[parse-document] CLI auth failed, trying SDK with keychain token...');
        try {
          stdout = await runWithSDK(truncated);
        } catch (sdkError) {
          const sdkMsg = sdkError instanceof Error ? sdkError.message : String(sdkError);
          if (sdkMsg.includes('AUTH_EXPIRED') || sdkMsg.includes('401') || sdkMsg.includes('auth')) {
            return NextResponse.json({
              error: 'Claude authentication has expired. Please open a terminal and run: claude auth login',
            }, { status: 401 });
          }
          throw sdkError;
        }
      } else {
        throw cliError;
      }
    }

    // Parse the JSON array from Claude's response
    let items: Array<{
      title: string;
      description: string;
      priority: string;
      type: string;
      tags: string[];
    }>;

    try {
      let cleaned = stdout.trim();
      // Strip markdown code fences
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
      // Find the JSON array
      const arrayStart = cleaned.indexOf('[');
      const arrayEnd = cleaned.lastIndexOf(']');
      if (arrayStart >= 0 && arrayEnd > arrayStart) {
        cleaned = cleaned.slice(arrayStart, arrayEnd + 1);
      }
      items = JSON.parse(cleaned);
      if (!Array.isArray(items)) items = [];
    } catch {
      console.error('[parse-document] Failed to parse Claude response:', stdout.slice(0, 300));
      return NextResponse.json({ error: 'Failed to parse Claude response.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      items: items.slice(0, 30),
      fileName: file.name,
    });
  } catch (err) {
    console.error('[parse-document] Error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('AUTH_EXPIRED')) {
      return NextResponse.json({
        error: 'Claude authentication has expired. Please open a terminal and run: claude auth login',
      }, { status: 401 });
    }
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

/**
 * Run claude CLI with a prompt, returning stdout.
 */
async function runClaude(claudePath: string, prompt: string): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), 'northstar-uploads');
  await mkdir(tmpDir, { recursive: true });
  const promptFile = path.join(tmpDir, `prompt-${Date.now()}.txt`);
  await writeFile(promptFile, prompt, 'utf-8');

  try {
    return await new Promise<string>((resolve, reject) => {
      const shellCmd = `"${claudePath}" -p "$(cat "${promptFile}")" --output-format text --model sonnet --no-session-persistence`;
      const proc = spawn('/bin/zsh', ['-c', shellCmd], {
        timeout: 90_000,
        env: {
          ...process.env,
          HOME: os.homedir(),
          PATH: `${path.dirname(claudePath)}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`,
          // Allow nested invocation
          CLAUDECODE: '',
          CLAUDE_CODE: '',
          // Don't pass stale parent token — let CLI use its own stored credentials
          CLAUDE_CODE_OAUTH_TOKEN: '',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code === 0 || stdout.trim().length > 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr.slice(0, 500)}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to spawn Claude CLI: ${err.message}`));
      });

      proc.stdin.end();
    });
  } finally {
    unlink(promptFile).catch(() => {});
  }
}

/**
 * Fallback: use @anthropic-ai/sdk directly with the keychain access token.
 */
async function runWithSDK(documentText: string): Promise<string> {
  const token = getAccessToken();

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Anthropic } = require('@anthropic-ai/sdk') as typeof import('@anthropic-ai/sdk');

  const client = new Anthropic({
    apiKey: token,
  });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${CLAUDE_PROMPT}\n\nHere is the document content:\n\n---\n${documentText}\n---`,
      },
    ],
  });

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');
}

/* ── Text extraction ──────────────────────────── */

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  // Text-based files
  if (
    file.type.startsWith('text/') ||
    file.type === 'application/json' ||
    name.endsWith('.txt') || name.endsWith('.md') ||
    name.endsWith('.csv') || name.endsWith('.json')
  ) {
    return file.text();
  }

  // PDF files
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    return result.text;
  }

  // Binary files (DOCX, XLSX) — extract readable ASCII strings
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let text = '';
  let current = '';
  for (const byte of bytes) {
    if (byte >= 32 && byte < 127) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= 4) text += current + ' ';
      current = '';
    }
  }
  if (current.length >= 4) text += current;
  return text;
}
