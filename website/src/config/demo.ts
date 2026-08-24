import { SITE_URL } from './contact';

export const GITHUB_REPO = 'https://github.com/iman-suherman/ai-engineering-workbench';

export const DEMO_STEPS = [
  {
    step: '01',
    title: 'Clone the repo',
    description: 'Open source under GPL-3.0. No account or API key required.',
    code: 'git clone https://github.com/iman-suherman/ai-engineering-workbench.git\ncd ai-engineering-workbench',
  },
  {
    step: '02',
    title: 'Run the demo script',
    description: 'Scaffolds a sample investigation with a fictional checkout enquiry.',
    code: 'npm run demo',
  },
  {
    step: '03',
    title: 'Open in Cursor',
    description: 'Open the repo root. The agent reads AGENTS.md and the service registry automatically.',
    code: 'cursor .',
  },
  {
    step: '04',
    title: 'Paste the demo prompt',
    description: 'Copy examples/demo-cursor-prompt.md into Cursor Chat (or use prompts/investigate.md).',
    code: 'cat examples/demo-cursor-prompt.md',
  },
  {
    step: '05',
    title: 'Review the output',
    description: 'Finding, Evidence, Risk, Recommendation — you decide what to send. Nothing goes out automatically.',
    code: null,
  },
] as const;

export const LIVE_DEMO_HREF = `${SITE_URL}/contact?intent=live-demo`;
