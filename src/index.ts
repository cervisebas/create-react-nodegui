import minimist from 'minimist';
import colors from 'colors';
import path from 'path';
import fs from 'fs';
import { copyTemplate, template_path } from './utils/copyTemplate';
import ora from 'ora';
import inquirer from 'inquirer';
import execa from 'execa';

const argv = minimist(process.argv.slice(2));

const actual_path = process.cwd();
const project_name = argv._?.[0];

if (!project_name) {
  console.error(colors.red('❌ Project name not provided'));
  process.exit();
}

const project_path = path.resolve(actual_path, project_name);

if (fs.existsSync(project_path)) {
  console.error(colors.red('❌ A project with that name already exists in the current directory.'));
  process.exit();
}

const loading_project = ora('Configuring project...').start();

try {
  fs.mkdirSync(project_path);
  
  copyTemplate(project_path);

  const packageJson = JSON.parse(
    fs.readFileSync(
      path.resolve(template_path, 'package.json'),
      { encoding: 'utf-8' },
    ),
  );

  packageJson['name'] = project_name;
  packageJson['private'] = false;
  delete packageJson['packageManager'];

  fs.writeFileSync(
    path.resolve(project_path, 'package.json'),
    JSON.stringify(packageJson, undefined, 2),
    { encoding: 'utf-8' },
  );

  loading_project.text = 'Project configured!';
  
  loading_project.succeed();
} catch (error) {
  loading_project.fail(error as never);
}

(async () => {
  const { pkgm } = await inquirer.prompt([
    {
      name: 'pkgm',
      type: 'list',
      message: 'Please select a package manager:',
      choices: ['npm', 'yarn', 'pnpm', 'bun', 'skip'],
    }  
  ]);

  if (pkgm !== 'skip') {
    const install_packages = ora(`Installing packages with "${pkgm}"...`).start();

    try {
      switch (pkgm) {
        case 'npm':
          await execa(
            'npm install',
            { cwd: project_path },
          );
          break;
        
        case 'yarn':
          await execa(
            'yarn install',
            { cwd: project_path },
          );
          break;
        
        case 'pnpm':
          await execa(
            'pnpm install',
            { cwd: project_path },
          );
          break;
        
        case 'bun':
          await execa(
            'bun install',
            { cwd: project_path },
          );
          break;
      }

      install_packages.succeed('Dependencies installed');

      console.log('\nSuccessfully created project!');
    } catch (error) {
      install_packages.fail(error as never);
    }
  }

})();
