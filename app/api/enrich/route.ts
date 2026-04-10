import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { claudeMd, inputs } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a senior design-focused engineer at GDC Group (gambling.com). You're helping create a CLAUDE.md file that enforces design quality standards.

Below is a basic CLAUDE.md that was auto-generated. Enrich it with:
1. **Design-specific recommendations** — what to watch out for visually given this build category
2. **Common design pitfalls** for this type of project — spacing issues, font inconsistencies, color drift
3. **Platform-specific design considerations** if relevant (Genesis editor UX, Eve data display patterns, Origins content layout)
4. **Responsive design gotchas** for this category
5. **Performance considerations** that affect visual quality (image optimization, font loading, layout shift)

Keep the same markdown format. Don't remove any existing content — only add to it.
The Design Standards section is mandatory and must remain intact.

Project inputs:
- Name: ${inputs.projectName}
- Category: ${inputs.category}
- Figma URL: ${inputs.figmaUrl || 'Not provided'}

Product spec (first 500 chars):
${(inputs.productSpec || '').slice(0, 500)}

Current CLAUDE.md:
${claudeMd}

Return ONLY the enriched CLAUDE.md content, no explanation or wrapping.`,
        },
      ],
    });

    const enriched = message.content[0].type === 'text' ? message.content[0].text : claudeMd;

    return NextResponse.json({ enriched });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
