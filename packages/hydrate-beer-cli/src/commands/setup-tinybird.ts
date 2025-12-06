import chalk from "chalk";
import ora from "ora";
import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

interface Config {
  tinybirdToken: string;
  tinybirdRegion?: string;
}

function loadConfig(): Config | null {
  const cwd = process.cwd();
  const configPaths = [
    path.join(cwd, "hydrate-beer.config.ts"),
    path.join(cwd, "hydrate-beer.config.js"),
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const tokenMatch = content.match(/tinybirdToken:\s*["']([^"']+)["']/);
      const regionMatch = content.match(/tinybirdRegion:\s*["']([^"']+)["']/);
      
      if (tokenMatch) {
        return { 
          tinybirdToken: tokenMatch[1],
          tinybirdRegion: regionMatch ? regionMatch[1] : "us-east"
        };
      }
    }
  }

  return null;
}

const EVENTS_DATASOURCE = `SCHEMA >
    \`timestamp\` DateTime64(3),
    \`projectId\` String,
    \`sessionId\` String,
    \`userId\` String,
    \`eventType\` Enum('hydration', 'render', 'navigation', 'page_timing', 'error', 'custom'),
    \`route\` String,
    \`componentName\` String,
    \`duration\` Float32,
    \`metadata\` String,
    \`userAgent\` String,
    \`country\` String,
    \`city\` String

ENGINE MergeTree
ENGINE_PARTITION_KEY toYYYYMM(timestamp)
ENGINE_SORTING_KEY timestamp, projectId, sessionId, eventType`;

const OVERVIEW_PIPE = `SELECT
    projectId,
    count() as total_events,
    uniq(sessionId) as total_sessions,
    avg(duration) as avg_hydration,
    countIf(eventType = 'render' AND duration > 16) as slow_renders
FROM events
WHERE projectId = {{String(projectId, required=True)}}
GROUP BY projectId`;

const REALTIME_PIPE = `SELECT
    timestamp,
    eventType,
    route,
    duration,
    componentName
FROM events
WHERE projectId = {{String(projectId, required=True)}}
ORDER BY timestamp DESC
LIMIT {{Int32(limit, 10)}}`;

export async function setupTinybirdCommand() {
  console.log(chalk.blue("\n🔗 Setting up Tinybird...\n"));

  const config = loadConfig();
  if (!config) {
    console.log(chalk.red("✖ No configuration found"));
    console.log(chalk.gray("  Run 'npx hydrate-beer init' first\n"));
    process.exit(1);
  }

  const baseUrl = `https://api.${config.tinybirdRegion}.tinybird.co/v0`;
  const headers = {
    "Authorization": `Bearer ${config.tinybirdToken}`,
    "Content-Type": "application/json",
  };

  const spinner = ora("Creating Tinybird datasources...").start();

  try {
    // Create events datasource
    const dsResponse = await fetch(`${baseUrl}/datasources`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "events",
        schema: EVENTS_DATASOURCE,
        engine: {
          type: "MergeTree",
          partition_key: "toYYYYMM(timestamp)",
          sorting_key: "timestamp, projectId, sessionId, eventType"
        }
      }),
    });

    if (!dsResponse.ok && dsResponse.status !== 409) { // 409 = already exists
      throw new Error(`Failed to create datasource: ${dsResponse.statusText}`);
    }

    spinner.succeed("Events datasource created");

    // Create overview pipe
    spinner.start("Creating overview pipe...");
    const overviewResponse = await fetch(`${baseUrl}/pipes`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "overview",
        sql: OVERVIEW_PIPE,
      }),
    });

    if (!overviewResponse.ok && overviewResponse.status !== 409) {
      throw new Error(`Failed to create overview pipe: ${overviewResponse.statusText}`);
    }

    spinner.succeed("Overview pipe created");

    // Create realtime metrics pipe
    spinner.start("Creating realtime_metrics pipe...");
    const realtimeResponse = await fetch(`${baseUrl}/pipes`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "realtime_metrics",
        sql: REALTIME_PIPE,
      }),
    });

    if (!realtimeResponse.ok && realtimeResponse.status !== 409) {
      throw new Error(`Failed to create realtime pipe: ${realtimeResponse.statusText}`);
    }

    spinner.succeed("Realtime metrics pipe created");

    console.log(chalk.green("\n✔ Tinybird setup complete!\n"));
    console.log(chalk.gray("  Your analytics backend is ready."));
    console.log(chalk.gray("  Run"), chalk.cyan("npx hydrate-beer monitor"), chalk.gray("to view your dashboard.\n"));

  } catch (error: any) {
    spinner.fail("Setup failed");
    console.log(chalk.red("\n✖ Error: " + error.message));
    console.log(chalk.gray("\n  Please check:"));
    console.log(chalk.gray("  1. Your Tinybird token is valid"));
    console.log(chalk.gray("  2. You have internet connection"));
    console.log(chalk.gray("  3. Your Tinybird region is correct\n"));
    process.exit(1);
  }
}
