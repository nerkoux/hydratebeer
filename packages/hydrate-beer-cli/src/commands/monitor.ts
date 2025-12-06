import chalk from "chalk";
import open from "open";
import * as fs from "fs";
import * as path from "path";

interface Config {
  posthogApiKey: string;
  posthogHost?: string;
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
      const apiKeyMatch = content.match(/posthogApiKey:\s*["']([^"']+)["']/);
      const hostMatch = content.match(/posthogHost:\s*["']([^"']+)["']/);
      
      if (apiKeyMatch) {
        return { 
          posthogApiKey: apiKeyMatch[1],
          posthogHost: hostMatch ? hostMatch[1] : "https://us.posthog.com"
        };
      }
    }
  }

  return null;
}

export async function monitorCommand() {
  console.log(chalk.blue("\n🍺 HydrateBeer Monitor\n"));

  const config = loadConfig();
  if (!config) {
    console.log(chalk.red("✖ No configuration found"));
    console.log(chalk.gray("  Run 'npx hydrate-beer init' first\n"));
    process.exit(1);
  }

  console.log(chalk.green("✔ Configuration found\n"));
  console.log(chalk.gray("  PostHog Host: " + (config.posthogHost || "https://us.posthog.com")));
  console.log(chalk.gray("  API Key: " + config.posthogApiKey.substring(0, 10) + "...\n"));

  console.log(chalk.blue("📊 View your analytics in PostHog:\n"));
  
  const posthogDashboardUrl = (config.posthogHost || "https://us.posthog.com").replace('//', '//app.');
  
  console.log(chalk.cyan("  Dashboard: " + posthogDashboardUrl));
  console.log(chalk.gray("  \n  Filter events by: hydratebeer_*\n"));
  console.log(chalk.gray("  Available events:"));
  console.log(chalk.gray("  - hydratebeer_page_view"));
  console.log(chalk.gray("  - hydratebeer_navigation"));
  console.log(chalk.gray("  - hydratebeer_component_render"));
  console.log(chalk.gray("  - hydratebeer_error"));
  console.log(chalk.gray("  - hydratebeer_session_start"));
  console.log(chalk.gray("  - hydratebeer_custom\n"));

  console.log(chalk.blue("  Opening PostHog dashboard...\n"));
  
  try {
    await open(posthogDashboardUrl);
  } catch (error) {
    console.log(chalk.yellow("  Could not open browser automatically."));
    console.log(chalk.gray("  Please visit: " + posthogDashboardUrl + "\n"));
  }
}
