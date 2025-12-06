import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export async function linkCommand(projectId: string) {
  console.log(chalk.blue('\n🍺 Linking to HydrateBeer dashboard...\n'));

  if (!projectId) {
    console.log(chalk.red('❌ Error: Project ID is required'));
    console.log(chalk.dim('   Usage: npx hydrate-beer link <projectId>\n'));
    process.exit(1);
  }

  // Validate project ID format (example: hb_proj_abc123xyz)
  const projectIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!projectIdRegex.test(projectId)) {
    console.log(chalk.red('❌ Error: Invalid project ID format'));
    console.log(chalk.dim('   Project ID should only contain letters, numbers, hyphens, and underscores.\n'));
    process.exit(1);
  }

  const spinner = ora('Verifying project ID...').start();

  // TODO: In production, verify project ID with HydrateBeer API
  // For now, we'll just update the config files
  
  const cwd = process.cwd();

  // Update config files
  const configFiles = [
    'hydrate-beer.config.js',
    'hydrate-beer.config.ts',
  ];

  let configUpdated = false;

  for (const configFile of configFiles) {
    const configPath = path.join(cwd, configFile);
    if (fs.existsSync(configPath)) {
      let content = fs.readFileSync(configPath, 'utf-8');
      
      // Replace projectId value
      content = content.replace(
        /projectId:\s*['"].*['"]/,
        `projectId: '${projectId}'`
      );
      
      fs.writeFileSync(configPath, content);
      spinner.succeed(`Updated ${configFile}`);
      configUpdated = true;
    }
  }

  // Update .env.local
  const envPath = path.join(cwd, '.env.local');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    if (envContent.includes('NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID')) {
      // Update existing value
      envContent = envContent.replace(
        /NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID=.*/,
        `NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID=${projectId}`
      );
    } else {
      // Add new value
      envContent += `\n# HydrateBeer\nNEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID=${projectId}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    spinner.succeed('Updated .env.local');
    configUpdated = true;
  }

  if (!configUpdated) {
    spinner.warn('No configuration files found. Run: npx hydrate-beer-cli init');
    process.exit(1);
  }

  console.log(chalk.green('\n✅ Successfully linked to HydrateBeer!\n'));
  console.log(chalk.cyan('📊 Project ID: ') + chalk.yellow(projectId));
  console.log(chalk.dim('\n   View analytics: https://hydratebeer.com/dashboard/' + projectId + '\n'));
  console.log(chalk.cyan('🚀 Next steps:\n'));
  console.log('  1. Install SDK: ' + chalk.yellow('npm install hydrate-beer-sdk'));
  console.log('  2. Add to your app (see docs for framework-specific setup)');
  console.log('  3. Deploy and start tracking!\n');
  console.log(chalk.dim('  Docs: https://hydratebeer.com/docs/quick-start\n'));
}
