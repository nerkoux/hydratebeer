import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

function generateProjectId(): string {
  return `proj_${randomBytes(16).toString("hex")}`;
}

const CONFIG_TEMPLATE = (projectId: string, passwordHash: string, tinybirdToken: string) => `// HydrateBeer Configuration
// Learn more: https://hydratebeer.com/docs

export default {
  projectId: "${projectId}",
  passwordHash: "${passwordHash}",
  tinybirdToken: "${tinybirdToken}",
  tinybirdRegion: "us-east",
  sampleRate: 1.0,
  slowRenderThreshold: 16,
  flushInterval: 5000,
  batchSize: 50,
};
`;

const ENV_TEMPLATE = (projectId: string, tinybirdToken: string) => `# HydrateBeer
NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID=${projectId}
NEXT_PUBLIC_HYDRATE_BEER_TINYBIRD_TOKEN=${tinybirdToken}
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

  // Generate project ID
  const projectId = generateProjectId();
  console.log(chalk.cyan(`\n  Generated Project ID: ${projectId}\n`));

  // Password setup
  const passwordResp = await prompts([
    {
      type: "password",
      name: "password",
      message: "Enter a password to secure your monitoring dashboard:",
      validate: (value) => value.length >= 6 || "Password must be at least 6 characters",
    },
    {
      type: "password",
      name: "confirmPassword",
      message: "Re-confirm your password:",
      validate: (value, prev) => value === prev.password || "Passwords do not match",
    },
  ]);

  if (!passwordResp.password || !passwordResp.confirmPassword) {
    console.log(chalk.yellow("\n  ✖ Password setup cancelled."));
    process.exit(0);
  }

  const passwordHash = bcrypt.hashSync(passwordResp.password, 10);

  // Tinybird setup
  console.log(chalk.blue("\n🔗 Tinybird Setup\n"));
  console.log(chalk.gray("  HydrateBeer uses Tinybird to store your analytics data."));
  console.log(chalk.gray("  1. Create a FREE account at: https://tinybird.co"));
  console.log(chalk.gray("  2. Copy your API token from: https://ui.tinybird.co/tokens\n"));

  const tinybirdResp = await prompts({
    type: "text",
    name: "token",
    message: "Enter your Tinybird API token:",
    validate: (value) => value.length > 0 || "Token is required",
  });

  if (!tinybirdResp.token) {
    console.log(chalk.yellow("\n  ✖ Setup cancelled."));
    process.exit(0);
  }

  const resp = await prompts([{
    type: "select",
    name: "configFormat",
    message: "Choose configuration format:",
    choices: [
      { title: "TypeScript (hydrate-beer.config.ts)", value: "ts" },
      { title: "JavaScript (hydrate-beer.config.js)", value: "js" },
      { title: "Environment variables (.env.local)", value: "env" },
    ],
    initial: 0,
  }]);

  if (!resp.configFormat) {
    console.log(chalk.yellow("\n  Cancelled."));
    process.exit(0);
  }

  spinner.start("Creating files...");

  if (resp.configFormat === "js" || resp.configFormat === "ts") {
    const file = resp.configFormat === "js" ? "hydrate-beer.config.js" : "hydrate-beer.config.ts";
    const fpath = path.join(cwd, file);
    if (!fs.existsSync(fpath)) {
      fs.writeFileSync(fpath, CONFIG_TEMPLATE(projectId, passwordHash, tinybirdResp.token));
      spinner.succeed(`Created ${file}`);
    }
  }

  const envPath = path.join(cwd, ".env.local");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, ENV_TEMPLATE(projectId, tinybirdResp.token));
    spinner.succeed("Created .env.local");
  } else {
    // Append to existing .env.local
    const envContent = fs.readFileSync(envPath, "utf-8");
    if (!envContent.includes("NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID")) {
      fs.appendFileSync(envPath, `\nNEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID=${projectId}\n`);
    }
    if (!envContent.includes("NEXT_PUBLIC_HYDRATE_BEER_TINYBIRD_TOKEN")) {
      fs.appendFileSync(envPath, `NEXT_PUBLIC_HYDRATE_BEER_TINYBIRD_TOKEN=${tinybirdResp.token}\n`);
    }
    spinner.succeed("Updated .env.local");
  }

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
    message: "Install hydrate-beer-sdk?",
    initial: true,
  });

  if (installResp.install) {
    const pm = detectPackageManager();
    spinner.start(`Installing with ${pm}...`);
    try {
      installPackage(pm, "hydrate-beer-sdk");
      spinner.succeed("Installed hydrate-beer-sdk");
    } catch (e) {
      spinner.fail("Failed to install");
    }
  }

  console.log(chalk.green("\n✔ Done!\n"));
  console.log(chalk.gray("  Next steps:"));
  console.log(chalk.gray("  1. Deploy Tinybird schema:"));
  console.log(chalk.cyan("     npx hydrate-beer setup-tinybird"));
  console.log(chalk.gray("  2. Add HydrateBeerProvider to your app"));
  console.log(chalk.gray("  3. Run:"), chalk.cyan("npx hydrate-beer monitor\n"));
}
