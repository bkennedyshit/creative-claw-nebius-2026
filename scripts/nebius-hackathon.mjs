import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const NEBIUS_ENDPOINT = "https://api.tokenfactory.nebius.com/v1";
export const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultState = path.join(homedir(), ".creativeclaw-nebius-2026");

export function pathsFor(stateDir = defaultState, local = false) {
  const state = path.resolve(stateDir, local ? "local" : "sponsor");
  return {
    state,
    config: path.join(state, "creativeclaw.json"),
    workspace: path.join(state, "workspace"),
  };
}

export function buildConfig({
  paths,
  local = false,
  model = DEFAULT_MODEL,
  port = 18990,
  token,
  assetExists = existsSync,
}) {
  if (!/^nvidia\/[A-Za-z0-9_.-]+$/.test(model)) {
    throw new Error("Select an NVIDIA model ID from the current Nebius catalog (nvidia/...).");
  }
  if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 18789) {
    throw new Error(
      "Use a dedicated port from 1024 to 65535, different from the original gateway's 18789.",
    );
  }
  const defaults = { workspace: paths.workspace, skipBootstrap: true, heartbeat: { every: "0m" } };
  if (!local) {
    defaults.model = { primary: `nebius/${model}` };
  }
  // Built plugins resolve a different bundled directory; use the provisioned source assets explicitly.
  const nativeAssets = path.join(repo, "extensions", "creative-engines", "binaries");
  const vfxLibrary =
    process.platform === "win32"
      ? "omni_video_bridge.dll"
      : process.platform === "darwin"
        ? "libomni_video_bridge.dylib"
        : "libomni_video_bridge.so";
  const vfxPath = path.join(nativeAssets, "vfx", vfxLibrary);
  const engines = {
    image: { binaryPath: nativeAssets },
    audio: { binaryPath: nativeAssets },
    video: { binaryPath: nativeAssets },
    vector: { binaryPath: nativeAssets },
    ...(assetExists(vfxPath) ? { vfx: { binaryPath: vfxPath } } : {}),
  };
  return {
    agents: {
      defaults,
      list: [{ id: "creative-nebius", default: true, name: "Creative Claw Nebius" }],
    },
    tools: { allow: ["creative-engines", "visual-memory", "gpu-broker"] },
    plugins: {
      allow: ["creative-engines", "visual-memory", "gpu-broker"],
      entries: {
        "creative-engines": { enabled: true, config: engines },
        // This plugin's inherited default uses a shared home path, not OPENCLAW_STATE_DIR.
        "visual-memory": {
          enabled: true,
          config: { storePath: path.join(paths.state, "visual-memory") },
        },
        "gpu-broker": { enabled: true },
      },
    },
    gateway: { mode: "local", port, bind: "loopback", auth: { mode: "token", token } },
    ...(!local
      ? {
          models: {
            providers: {
              nebius: {
                baseUrl: NEBIUS_ENDPOINT,
                api: "openai-completions",
                apiKey: { source: "env", provider: "default", id: "NEBIUS_API_KEY" },
                models: [
                  {
                    id: model,
                    name: "NVIDIA Nemotron on Nebius",
                    input: ["text"],
                    // Conservative application budgets below the documented 256K model context.
                    contextWindow: 128000,
                    maxTokens: 4096,
                  },
                ],
              },
            },
          },
        }
      : {}),
  };
}

export function childEnvironment(paths, env = process.env) {
  // Explicit overrides isolate config, auth, SQLite state, jobs and sessions from the original gateway.
  const child = {
    ...env,
    OPENCLAW_STATE_DIR: paths.state,
    OPENCLAW_CONFIG_PATH: paths.config,
    OPENCLAW_PROFILE: "nebius-hackathon",
  };
  // The CLI honors gateway URL/auth environment overrides before profile config.
  // Never send the sponsor smoke to an inherited original-gateway connection.
  for (const name of [
    "OPENCLAW_GATEWAY_URL",
    "OPENCLAW_GATEWAY_PORT",
    "OPENCLAW_GATEWAY_TOKEN",
    "OPENCLAW_GATEWAY_PASSWORD",
  ]) {
    delete child[name];
  }
  return child;
}

export function requireSponsorKey(env = process.env) {
  if (!env.NEBIUS_API_KEY?.trim()) {
    throw new Error(
      "NEBIUS_API_KEY is missing. NVIDIA inference on Nebius is unavailable. Use setup --local and start --local for native Studio testing only.",
    );
  }
}

const agentInstructions = `# Creative Claw - Nebius creator assistant

Help creators edit ordinary image, audio, video and vector files. This is a general-purpose application.
Discover available operations with the creative tools before choosing one. Inspect parameter descriptors.
Only use operations whose engines are actually available. Never claim an edit succeeded without a completed tool result and saved output.
Preserve source files and existing exports. Ask for an output path or use the managed artifact output when supported.
Honor user corrections. Explain the saved path and limitations. Use visual-memory only through its tools; do not invent persistence.
Current visual-memory hash retrieval is lexical/byte similarity, not semantic vision search.
Stay within the requested media operation; no shell, browser, publishing, billing or unrelated automation.
An offline native Studio run is not evidence of NVIDIA inference. Sponsor usage must be proven by actual Nebius model/tool traces.
`;

export function setup({ paths, local, model, port }) {
  if (existsSync(paths.config)) {
    throw new Error(
      "This profile already has a config. Keep existing native paths and settings; inspect/edit its canonical config rather than overwrite it.",
    );
  }
  const config = buildConfig({ paths, local, model, port, token: randomBytes(32).toString("hex") });
  mkdirSync(paths.workspace, { recursive: true });
  writeFileSync(paths.config, `${JSON.stringify(config, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  writeFileSync(path.join(paths.workspace, "AGENTS.md"), agentInstructions, { flag: "wx" });
  return config;
}

export function runCli(args, paths, env = process.env) {
  const result = spawnSync(process.execPath, [path.join(repo, "openclaw.mjs"), ...args], {
    cwd: repo,
    env: childEnvironment(paths, env),
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.error) {
    throw new Error(
      "Could not launch Creative Claw. Check the Node installation and built application.",
    );
  }
  return result.status ?? 1;
}

export function main(argv = process.argv.slice(2)) {
  const [command, ...options] = argv;
  const local = options.includes("--local");
  function value(flag, fallback) {
    const index = options.indexOf(flag);
    if (index === -1) {
      return fallback;
    }
    if (!options[index + 1] || options[index + 1].startsWith("--")) {
      throw new Error(`${flag} needs a value`);
    }
    return options[index + 1];
  }
  const paths = pathsFor(value("--state-dir", defaultState), local);
  if (command === "setup") {
    const config = setup({
      paths,
      local,
      model: value("--model", DEFAULT_MODEL),
      port: Number(value("--port", "18990")),
    });
    console.log(
      JSON.stringify({
        mode: local ? "local-native-only" : "nebius-sponsor",
        stateDir: paths.state,
        configPath: paths.config,
        port: config.gateway.port,
        credentialStored: false,
      }),
    );
    return 0;
  }
  if (!existsSync(paths.config)) {
    throw new Error(`Run setup${local ? " --local" : ""} first.`);
  }
  const config = JSON.parse(readFileSync(paths.config, "utf8"));
  if (command === "dashboard") {
    return runCli(["dashboard", ...(options.includes("--no-open") ? ["--no-open"] : [])], paths);
  }
  if (command === "check") {
    const sponsor = config.models?.providers?.nebius;
    console.log(
      JSON.stringify({
        mode: local ? "local-native-only" : "nebius-sponsor",
        endpoint: sponsor?.baseUrl ?? null,
        model: sponsor?.models?.[0]?.id ?? null,
        credentialAvailable: Boolean(process.env.NEBIUS_API_KEY?.trim()),
        inferenceVerified: false,
        port: config.gateway.port,
        configPath: paths.config,
      }),
    );
    return local || process.env.NEBIUS_API_KEY?.trim() ? 0 : 2;
  }
  if (command === "start") {
    if (!local) {
      requireSponsorKey();
    }
    if (local) {
      console.log(
        "LOCAL NATIVE STUDIO ONLY: no Nebius provider configured; sponsor inference is unavailable.",
      );
    }
    return runCli(["gateway", "--port", String(config.gateway.port)], paths);
  }
  if (command === "smoke") {
    if (local) {
      throw new Error(
        "Local Studio is tested through native operations. A sponsor smoke requires the real key and sponsor profile; no synthetic inference success is generated.",
      );
    }
    requireSponsorKey();
    const provider = config.models?.providers?.nebius;
    if (provider?.baseUrl !== NEBIUS_ENDPOINT || !provider.models?.[0]?.id?.startsWith("nvidia/")) {
      throw new Error(
        "Sponsor profile must target the documented Nebius endpoint and an NVIDIA model.",
      );
    }
    // Exercise the actual gateway agent runtime, not a parallel HTTP/model/tool implementation.
    return runCli(
      [
        "agent",
        "--agent",
        "creative-nebius",
        "--message",
        "Use the image.list_ops tool now to discover actual native image capabilities. Do not edit any file. Report engine availability from the tool result and do not invent operations.",
        "--json",
      ],
      paths,
    );
  }
  throw new Error(
    "Usage: node scripts/nebius-hackathon.mjs setup|check|start|dashboard|smoke [--local] [--state-dir PATH] [--model NVIDIA_ID] [--port 18990]",
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
