import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

// The real D1 id is injected at build time so it never has to be committed.
// Cloudflare Workers Builds sets these as build environment variables; local
// development falls back to the placeholder, which Miniflare is happy with.
const D1_DATABASE_ID =
    process.env.D1_DATABASE_ID || "4d1ddb34-99ba-4c10-997e-e7e1eebdb92b";
const D1_DATABASE_NAME = process.env.D1_DATABASE_NAME || "site-creator-d1";

const { d1, r2 } = hostingConfig;

// Cloudflare's dashboard stores these as *build* variables, which are visible
// to `npm run build` but never appear in `env` inside the running Worker. The
// build therefore copies them into the generated wrangler.json so they become
// real runtime variables. Values are never committed - they come from the
// build environment. A name that is absent or blank is omitted entirely rather
// than deployed as an empty string, so a missing value can never quietly
// overwrite a good one.
const RUNTIME_VAR_NAMES = [
  "BOT_PROTECTION_SECRET",
  "GOOGLE_MAIL_WEBHOOK_URL",
  "GOOGLE_MAIL_WEBHOOK_SECRET",
] as const;

const runtimeVars: Record<string, string> = Object.fromEntries(
  RUNTIME_VAR_NAMES.map((name) => [name, (process.env[name] ?? "").trim()]).filter(
    ([, value]) => value !== "",
  ),
);

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  vars: runtimeVars,
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: D1_DATABASE_NAME,
          database_id: D1_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
