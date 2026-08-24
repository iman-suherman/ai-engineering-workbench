# Try the self-serve demo

Hands-on trial of the workbench using a fictional checkout platform. No live demo booking required.

## Prerequisites

- Node.js 18+ (for `npm run demo` only — the workbench itself has no runtime deps)
- Cursor or GitHub Copilot with this repo open
- Optional: sibling checkouts for `checkout-api`, `payments-api`, `edge-gateway-config`

## Steps

1. Clone and open the repo in your editor.
2. Run `npm run demo` — scaffolds a sample investigation under `communications/investigations/demo/`.
3. Open the generated `*-investigate.md` file.
4. Paste `examples/demo-cursor-prompt.md` into Cursor Chat (or reference `prompts/investigate.md` with the enquiry text).
5. Review Finding / Evidence / Risk / Recommendation — nothing is sent automatically.
6. Optional: run `npm run start:explain` to see the full pipeline.

## What you are testing

- Service registry navigation (`knowledge/service-registry.yaml`)
- Evidence-first investigation prompts
- Human-in-the-loop output shape
- Optional compose draft via `prompts/compose-chat-response.md`

## Live demo vs self-serve

| | Self-serve (`npm run demo`) | Live demo (contact form) |
|--|-----------------------------|---------------------------|
| Who runs it | You, in your editor | Guided session with Iman |
| Your repos | Fictional sample registry | Can use your real services |
| Duration | ~10–20 min at your pace | ~30–45 min scheduled call |

Book a live demo: https://workbench.suherman.net/contact?intent=live-demo
