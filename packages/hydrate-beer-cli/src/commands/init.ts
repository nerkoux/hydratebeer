import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";

const CONFIG_TEMPLATE = (posthogApiKey: string, posthogHost: string) => `import type { HydrateBeerConfig } from 'hydrate-beer';

const config: HydrateBeerConfig = {
  posthogApiKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY!,
  posthogHost: "${posthogHost}",
};

export default config;
`;

const ENV_TEMPLATE = (posthogApiKey: string) => `# HydrateBeer with PostHog
NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY=${posthogApiKey}
`;

function detectPackageManager(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

function installPackage(packageManager: string, packageName: string): void {
  const commands: Record<string, string> = {
    npm: `npm install ${packageName}`,
    yarn: `yarn add ${packageName}`,
    pnpm: `pnpm add ${packageName}`,
    bun: `bun add ${packageName}`,
  };
  execSync(commands[packageManager], { stdio: "inherit", cwd: process.cwd() });
}

export async function initCommand() {
  console.log(chalk.blue("\n🍺 Initializing HydrateBeer...\n"));
  const spinner = ora("Checking project structure...").start();
  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, "package.json");
  
  if (!fs.existsSync(packageJsonPath)) {
    spinner.fail("No package.json found.");
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const isNext = pkg.dependencies?.next || pkg.devDependencies?.next;
  const isReact = pkg.dependencies?.react || pkg.devDependencies?.react;

  if (!isReact) {
    spinner.fail("React not found.");
    process.exit(1);
  }

  spinner.succeed(`Detected ${isNext ? "Next.js" : "React"} project`);

  // PostHog setup
  console.log(chalk.blue("\n📊 PostHog Setup\n"));
  console.log(chalk.gray("  HydrateBeer uses PostHog to store your analytics data."));
  console.log(chalk.gray("  1. Create a FREE account at: https://posthog.com"));
  console.log(chalk.gray("  2. Create a new project"));
  console.log(chalk.gray("  3. Copy your Project API Key from: Project Settings -> Project API Key\n"));

  const posthogResp = await prompts({
    type: "text",
    name: "apiKey",
    message: "Enter your PostHog Project API Key:",
    validate: (value) => value.length > 0 || "API Key is required",
  });

  if (!posthogResp.apiKey) {
    console.log(chalk.yellow("\n  ✖ Setup cancelled."));
    process.exit(0);
  }

  const hostResp = await prompts({
    type: "select",
    name: "host",
    message: "Select your PostHog instance:",
    choices: [
      { title: "PostHog Cloud (US)", value: "https://us.posthog.com" },
      { title: "PostHog Cloud (EU)", value: "https://eu.posthog.com" },
      { title: "Self-hosted", value: "custom" },
    ],
    initial: 0,
  });

  if (!hostResp.host) {
    console.log(chalk.yellow("\n  ✖ Setup cancelled."));
    process.exit(0);
  }

  let posthogHost = hostResp.host;
  if (hostResp.host === "custom") {
    const customHostResp = await prompts({
      type: "text",
      name: "customHost",
      message: "Enter your self-hosted PostHog URL:",
      validate: (value) => value.startsWith("http") || "URL must start with http:// or https://",
    });
    
    if (!customHostResp.customHost) {
      console.log(chalk.yellow("\n  ✖ Setup cancelled."));
      process.exit(0);
    }
    posthogHost = customHostResp.customHost;
  }

  spinner.start("Creating configuration files...");

  const configFile = "hydrate-beer.config.ts";
  const configPath = path.join(cwd, configFile);
  fs.writeFileSync(configPath, CONFIG_TEMPLATE(posthogResp.apiKey, posthogHost));
  spinner.text = `Created ${configFile}`;

  const envPath = path.join(cwd, ".env.local");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, ENV_TEMPLATE(posthogResp.apiKey));
    spinner.succeed("Created .env.local");
  } else {
    // Append to existing .env.local if key doesn't exist
    const envContent = fs.readFileSync(envPath, "utf-8");
    if (!envContent.includes("NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY")) {
      const newEnvLine = `\n# HydrateBeer with PostHog\nNEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY=${posthogResp.apiKey}\n`;
      fs.appendFileSync(envPath, newEnvLine);
      spinner.succeed("Updated .env.local with PostHog API key");
    } else {
      spinner.succeed(".env.local already contains PostHog API key");
    }
  }
  
  spinner.succeed("Configuration files created");

  const gitignore = path.join(cwd, ".gitignore");
  if (fs.existsSync(gitignore)) {
    const content = fs.readFileSync(gitignore, "utf-8");
    if (!content.includes(".env.local")) {
      fs.appendFileSync(gitignore, "\n.env.local\n");
    }
  }

  const installResp = await prompts({
    type: "confirm",
    name: "install",
    message: "Install hydrate-beer?",
    initial: true,
  });

  if (installResp.install !== undefined && installResp.install) {
    const pm = detectPackageManager();
    spinner.start(`Installing with ${pm}...`);
    try {
      installPackage(pm, "hydrate-beer");
      spinner.succeed("Installed hydrate-beer");
    } catch (e) {
      spinner.fail("Failed to install");
    }
  }

  console.log(chalk.green("\n✔ Done!\n"));
  console.log(chalk.gray("  PostHog Configuration:"));
  console.log(chalk.cyan(`    API Key: ${posthogResp.apiKey.substring(0, 10)}...`));
  console.log(chalk.cyan(`    Host: ${posthogHost}`));
  console.log(chalk.gray("\n  Next steps:"));
  console.log(chalk.gray("  1. Add HydrateBeerProvider to your app (see docs)"));
  console.log(chalk.gray("  2. View analytics in PostHog:"), chalk.cyan(posthogHost.replace('//', '//app.')));
  console.log(chalk.gray("  3. Filter by events:"), chalk.cyan("hydratebeer_*\n"));
}
