#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { monitorCommand } from './commands/monitor';

const program = new Command();

program
  .name('hydrate-beer')
  .description('🍺 Zero-config performance monitoring for React and Next.js')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize HydrateBeer in your project')
  .action(initCommand);

program
  .command('monitor')
  .description('Open live monitoring dashboard')
  .action(monitorCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log(chalk.yellow('\n🍺 HydrateBeer CLI\n'));
  program.outputHelp();
}
