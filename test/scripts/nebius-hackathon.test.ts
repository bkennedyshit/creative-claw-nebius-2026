import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildConfig,
  childEnvironment,
  pathsFor,
  requireSponsorKey,
  setup,
  DEFAULT_MODEL,
  NEBIUS_ENDPOINT,
} from "../../scripts/nebius-hackathon.mjs";

describe("Nebius hackathon setup boundaries", () => {
  it("makes local native testing independent of sponsor credentials", () => {
    const paths = pathsFor(path.join(tmpdir(), "nebius-test"), true);
    const config = buildConfig({ paths, local: true, port: 18990, token: "test-token" });
    expect(config).not.toHaveProperty("models");
    expect(config.agents.defaults).not.toHaveProperty("model");
    expect(config.gateway).toMatchObject({
      port: 18990,
      bind: "loopback",
      auth: { mode: "token" },
    });
    expect(config.agents.defaults.heartbeat.every).toBe("0m");
  });

  it("routes sponsor inference through Nebius using an environment secret reference", () => {
    const paths = pathsFor(path.join(tmpdir(), "nebius-test"));
    const config = buildConfig({ paths, port: 18990, model: DEFAULT_MODEL, token: "test-token" });
    expect(config.models.providers.nebius).toMatchObject({
      baseUrl: NEBIUS_ENDPOINT,
      api: "openai-completions",
      apiKey: { source: "env", provider: "default", id: "NEBIUS_API_KEY" },
    });
    expect(config.agents.defaults.model.primary).toBe(`nebius/${DEFAULT_MODEL}`);
    expect(() => requireSponsorKey({})).toThrow("NEBIUS_API_KEY is missing");
    expect(() => requireSponsorKey({ NEBIUS_API_KEY: "  " })).toThrow();
  });

  it("keeps state isolated even when the caller has original-gateway overrides", () => {
    const base = path.join(tmpdir(), "nebius-test");
    const paths = pathsFor(base);
    const child = childEnvironment(paths, {
      OPENCLAW_STATE_DIR: "original",
      OPENCLAW_CONFIG_PATH: "original.json",
      OPENCLAW_GATEWAY_URL: "ws://127.0.0.1:18789",
      OPENCLAW_GATEWAY_TOKEN: "original-token",
      KEEP: "yes",
    });
    expect(child.OPENCLAW_STATE_DIR).toBe(paths.state);
    expect(child.OPENCLAW_CONFIG_PATH).toBe(paths.config);
    expect(child.KEEP).toBe("yes");
    expect(child.OPENCLAW_GATEWAY_URL).toBeUndefined();
    expect(child.OPENCLAW_GATEWAY_TOKEN).toBeUndefined();
    expect(pathsFor(base, true).state).not.toBe(paths.state);
    expect(() => buildConfig({ paths, port: 18789, token: "test" })).toThrow("dedicated port");
    expect(() => buildConfig({ paths, model: "meta/llama", token: "test" })).toThrow(
      "NVIDIA model",
    );
  });

  it("never overwrites an existing configured profile", () => {
    const base = mkdtempSync(path.join(tmpdir(), "nebius-profile-"));
    try {
      const paths = pathsFor(base, true);
      setup({ paths, local: true, port: 18990 });
      const original = readFileSync(paths.config, "utf8");
      expect(() => setup({ paths, local: true, port: 18991 })).toThrow("already has a config");
      expect(readFileSync(paths.config, "utf8")).toBe(original);
      expect(original).not.toContain("NEBIUS_API_KEY");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("keeps visual-memory databases inside their separate local and sponsor profiles", () => {
    const base = path.join(tmpdir(), "nebius-memory-test");
    const localPaths = pathsFor(base, true);
    const sponsorPaths = pathsFor(base);
    const local = buildConfig({ paths: localPaths, local: true, token: "test-token" });
    const sponsor = buildConfig({ paths: sponsorPaths, token: "test-token" });
    const localStore = local.plugins.entries["visual-memory"].config.storePath;
    const sponsorStore = sponsor.plugins.entries["visual-memory"].config.storePath;
    expect(localStore).toBe(path.join(localPaths.state, "visual-memory"));
    expect(sponsorStore).toBe(path.join(sponsorPaths.state, "visual-memory"));
    expect(path.relative(localPaths.state, localStore)).toBe("visual-memory");
    expect(path.relative(sponsorPaths.state, sponsorStore)).toBe("visual-memory");
    expect(localStore).not.toBe(sponsorStore);
  });

  it("points built-plugin engines at this repository's provisioned native assets", () => {
    const paths = pathsFor(path.join(tmpdir(), "nebius-assets-test"), true);
    const expected = fileURLToPath(
      new URL("../../extensions/creative-engines/binaries", import.meta.url),
    );
    for (const local of [true, false]) {
      const config = buildConfig({ paths, local, token: "test-token", assetExists: () => true });
      const engines = config.plugins.entries["creative-engines"].config;
      for (const engine of ["image", "audio", "video", "vector"]) {
        expect(engines[engine].binaryPath).toBe(expected);
      }
      expect(path.dirname(engines.vfx.binaryPath)).toBe(path.join(expected, "vfx"));
      const absent = buildConfig({ paths, local, token: "test-token", assetExists: () => false });
      expect(absent.plugins.entries["creative-engines"].config).not.toHaveProperty("vfx");
    }
  });
});
