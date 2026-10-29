# Nebius testing and isolated launch

The existing Creative Studio frontend and native media tools are retained. Setup uses the application's existing custom-provider/configuration mechanism; no second inference runtime is introduced.

## Local native Studio - no Nebius key needed

After installing dependencies, building the application/UI and provisioning the native libraries described in `extensions/creative-engines/binaries/README.md`:

```powershell
node scripts/nebius-hackathon.mjs setup --local
node scripts/nebius-hackathon.mjs check --local
node scripts/nebius-hackathon.mjs start --local
# In another terminal, open this profile's authenticated dashboard:
node scripts/nebius-hackathon.mjs dashboard --local
```

This profile lives under `~/.creativeclaw-nebius-2026/local`, uses port 18990, and has no hosted provider or placeholder API credential. Open the authenticated dashboard through the gateway's normal dashboard flow, then choose Creative Studio. It is a local media test, not a working NVIDIA/Nebius inference demonstration. Local chat is not configured for sponsor inference; use Studio's native workflow controls.

Setup creates a canonical `creativeclaw.json` and an agent workspace. It never overwrites an existing profile. It explicitly points the image/audio/video/vector `binaryPath` settings at this checkout's `extensions/creative-engines/binaries` directory, so the built plugin uses the same provisioned assets as source tests. If a platform VFX bridge is provisioned under `binaries/vfx/`, setup adds its explicit library path too. Binaries remain separately provisioned and ignored by Git. Existing profiles created before these settings were added need the paths updated in their canonical plugin config. Adjust those paths if you keep native assets elsewhere. Setup prints paths and mode but never prints the generated gateway token. Use `--state-dir PATH` to select another isolated parent directory and `--port PORT` on setup to change the dedicated port.

Visual-memory storage is explicitly configured as `<profile-state>/visual-memory` in both modes. This overrides the inherited plugin's shared `~/.openclaw/visual-memory` default, so local and sponsor media indexes remain separate from each other and from the original application's index. Profiles generated before this setting was added need their `plugins.entries.visual-memory.config.storePath` set to their own profile's `visual-memory` directory before indexing media.

## Real sponsor inference - requires the user's Nebius key

```powershell
# Supply NEBIUS_API_KEY securely in this process environment; do not commit it.
node scripts/nebius-hackathon.mjs setup
node scripts/nebius-hackathon.mjs check
node scripts/nebius-hackathon.mjs start
# In another shell with the same key/environment and profile:
node scripts/nebius-hackathon.mjs smoke
```

The sponsor profile is separate at `~/.creativeclaw-nebius-2026/sponsor`. It targets `https://api.tokenfactory.nebius.com/v1` using the existing `openai-completions` transport and an environment-backed SecretRef. The initial NVIDIA candidate is `nvidia/nemotron-3-super-120b-a12b`; select another NVIDIA ID with `setup --model ID` only after verifying its current catalog availability, tool support and limits. [Nebius's model card](https://github.com/nebius/token-factory-cookbook/blob/main/models/nemotron/nemotron3-super-120B.md) documents 256K context and function calling. This app config uses a conservative 128,000-token context budget and a requested 4,096-token output budget, not a claim of the service's maximum output allowance. The text-only route uses existing media tools/local perception rather than claiming direct image/video input support.

Normal start/smoke fail explicitly when the key is absent. `check` exits 2 without credentials and always reports `inferenceVerified: false`: config presence is not inference evidence. There are no placeholder credentials and no silent fallback to another model host. Heartbeats are disabled to avoid unrequested background inference.

`smoke` invokes the actual application's gateway agent with a request to discover native image operations. It can make a billable model request only when the user deliberately runs it with a real key. It does not implement a parallel HTTP client, simulate tool results, or edit media. Preserve its gateway model/provider and tool trace: an assistant's textual claim alone is not proof of a real tool call. A successful exit alone is not full editing-loop validation.

## Acceptance before calling the entry ready

### Verified locally on October 29

- Upstream application baseline: `64536967c0e5729cce527730d44279279a0db208`; its Studio fixes remain inherited work.
- Full application/UI build passed using Node 24.22.1 and pnpm 11.2.2, with the frozen lockfile unchanged.
- Six launcher/setup tests and six selected real native Studio tests passed.
- The built gateway on port 18990 saved an inverted image with verified output pixels, saved a grayscale correction, trimmed a real video to two seconds, rejected an invalid trim interval and preserved the input image checksum.
- Two synthetic media files were indexed and retrieved through the actual visual-memory gateway methods in the isolated profile. The backend was hash retrieval, not semantic vision.
- Structured code review finished with no actionable findings. Native libraries/model assets are local prerequisites and are not included in GitHub source.

These checks do not prove sponsor inference, a model-selected edit/correction loop, browser preview interaction, cross-machine reproduction or submission readiness. The user has no Nebius key yet. The inherited engines and UI are not new hackathon features; this change adds the isolated setup/launch path and credential checks using existing application configuration.

- Native test: run one image operation, preview its actual saved output; run a 1-4 second video trim and inspect duration/output. Preserve originals.
- Sponsor test: capture actual Nebius endpoint/model usage and a model-selected creative tool call, plus its real result. Verify no provider fallback occurred.
- Full creator test: request an edit through the sponsor agent, inspect output in Studio, request a correction, and inspect/export the revised result.
- Failure test: unavailable engine, bad file/path and missing API key must be visible errors, never successful output claims.
- Reproduction: judges need setup instructions, usable native assets/build instructions, a working test build/demo, licensed public source, a public YouTube video under three minutes and an event-period change disclosure.

Setup tests exercise config isolation, credential absence and overwrite guards; they do not establish live model/tool behavior. No account, key, billing action, deployment or submission is performed by these commands.

Sources: [Nebius quickstart](https://docs.tokenfactory.nebius.com/quickstart), [function calling](https://docs.tokenfactory.nebius.com/ai-models-inference/function-calling), [official competition rules](https://nebiusglobalaihackathon.devpost.com/rules). Credential/model availability and real execution remain necessary checks.
