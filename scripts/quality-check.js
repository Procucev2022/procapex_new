#!/usr/bin/env node
/**
 * Universal Quality Check Runner for ProCPX Procurement System
 * 
 * Supports:
 *   - Full checks: Build -> Test Coverage (>=90%) -> Typecheck -> Lint -> Database Migrations/Validation
 *   - Fast checks (--fast): Checks only changed files (incremental typecheck, jest --onlyChanged, fast lint, prisma validate)
 *   - Multi-project workspace (--workspace): Scans and checks all projects in the workspace
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const isFast = args.includes('--fast');
const isWorkspace = args.includes('--workspace');
const shouldMigrate = args.includes('--migrate');
const shouldFix = args.includes('--fix');

// ANSI color helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function logHeader(msg) {
  console.log(`\n${colors.cyan}${colors.bold}=== ${msg} ===${colors.reset}`);
}

function logSuccess(msg) {
  console.log(`${colors.green}✔ ${msg}${colors.reset}`);
}

function logError(msg) {
  console.error(`${colors.red}✖ ${msg}${colors.reset}`);
}

function logWarning(msg) {
  console.warn(`${colors.yellow}⚠ ${msg}${colors.reset}`);
}

function runCommand(command, cwd = rootDir) {
  console.log(`${colors.dim}> (${path.relative(rootDir, cwd) || '.'}) ${command}${colors.reset}`);
  const startTime = Date.now();
  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: 'true' },
    });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logSuccess(`Completed in ${elapsed}s: ${command}`);
    return true;
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logError(`Failed after ${elapsed}s: ${command}`);
    return false;
  }
}

/**
 * Discover all project directories in the workspace containing package.json
 */
function findWorkspaceProjects(dir = rootDir, projects = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip known dependency and build directories
      if (['node_modules', '.next', 'build', 'dist', 'out', '.git', '.swc', 'coverage'].includes(entry.name)) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (fs.existsSync(path.join(fullPath, 'package.json'))) {
        projects.push(fullPath);
      }
      findWorkspaceProjects(fullPath, projects);
    }
  }
  return projects;
}

/**
 * Get changed files using git diff against HEAD / index
 */
function getChangedFiles() {
  try {
    const stdout = execSync('git status --porcelain', { encoding: 'utf8', cwd: rootDir });
    return stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => Boolean(line))
      .map(line => line.slice(3).trim());
  } catch {
    return [];
  }
}

/**
 * Run quality checks for a specific project directory
 */
function runQualityCheckForProject(projectDir, projectLabel = 'Root Project') {
  logHeader(`Running Quality Checks for: ${projectLabel}`);
  const isRoot = projectDir === rootDir;
  const changedFiles = getChangedFiles();

  if (isFast) {
    console.log(`${colors.yellow}Mode: FAST CHECK (Changes only)${colors.reset}`);
    if (changedFiles.length > 0) {
      console.log(`${colors.dim}Detected ${changedFiles.length} modified/untracked file(s).${colors.reset}`);
    } else {
      console.log(`${colors.dim}No git modifications detected. Running quick validations.${colors.reset}`);
    }

    // Fast Check Step 1: Fast Typecheck
    logHeader('1. Fast TypeScript Check');
    if (!runCommand('npx tsc --noEmit', projectDir)) return false;

    // Fast Check Step 2: Fast Unit Tests on changed files
    logHeader('2. Fast Unit Tests (Changed Files Only)');
    const jestCmd = 'npx jest --onlyChanged --passWithNoTests --detectOpenHandles';
    if (!runCommand(jestCmd, projectDir)) return false;

    // Fast Check Step 3: Fast Lint
    logHeader('3. Fast Lint Check');
    const lintCmd = shouldFix ? 'npm run lint -- --fix' : 'npm run lint';
    if (!runCommand(lintCmd, projectDir)) return false;

    // Fast Check Step 4: Fast Database Schema Check
    if (fs.existsSync(path.join(projectDir, 'prisma', 'schema.prisma'))) {
      logHeader('4. Fast Database Schema Validation');
      if (!runCommand('npx prisma validate', projectDir)) return false;
    }

    logSuccess(`Fast Quality Checks PASSED for ${projectLabel}!`);
    return true;
  }

  // Full Check Mode
  // MANDATORY ORDER: Build & Unit test coverage MUST be checked first.
  console.log(`${colors.cyan}Mode: FULL QUALITY CHECK (Strict Order: Build -> Coverage -> Typecheck -> Lint -> Database)${colors.reset}`);

  // Step 1: BUILD (Checked First)
  logHeader('Step 1: Production Build Verification (Checked First)');
  if (!runCommand('npm run build', projectDir)) {
    logError('Build failed! Address compilation or bundling errors.');
    return false;
  }

  // Step 2: UNIT TEST COVERAGE (Checked First, Strict 90% Per File)
  logHeader('Step 2: Unit Test Code Coverage Verification (>= 90% Per File)');
  if (!runCommand('npm run test:coverage', projectDir)) {
    logError('Unit tests or code coverage failed! Ensure 90% threshold across all files.');
    return false;
  }

  // Step 3: TYPECHECK
  logHeader('Step 3: TypeScript Type Checking');
  if (!runCommand('npm run typecheck', projectDir)) {
    logError('TypeScript typechecking failed! Fix typing discrepancies.');
    return false;
  }

  // Step 4: LINT
  logHeader('Step 4: Linting & Code Quality');
  const lintCmd = shouldFix ? 'npm run lint -- --fix' : 'npm run lint';
  if (!runCommand(lintCmd, projectDir)) {
    logError('Lint checks failed! Fix formatting, unescaped entities, or lint rules.');
    return false;
  }

  // Step 5: DATABASE SCHEMA & MIGRATIONS
  if (fs.existsSync(path.join(projectDir, 'prisma', 'schema.prisma'))) {
    logHeader('Step 5: Database Schema Validation & Migration Check');
    if (!runCommand('npx prisma validate', projectDir)) {
      logError('Prisma schema validation failed!');
      return false;
    }

    // If migrate flag or requested, attempt to apply pending migrations
    if (shouldMigrate) {
      logHeader('Applying Database Migrations...');
      try {
        runCommand('npx prisma db push', projectDir);
      } catch (e) {
        logWarning('Database migration push skipped or failed (ensure database server is running).');
      }
    }
  }

  logSuccess(`All Quality Checks PASSED successfully for ${projectLabel}!`);
  return true;
}

/**
 * Main execution entry point
 */
function main() {
  const overallStart = Date.now();
  console.log(`${colors.bold}${colors.cyan}====================================================`);
  console.log('         PROCPX QUALITY ASSURANCE SYSTEM');
  console.log(`====================================================${colors.reset}`);

  const workspaceProjects = findWorkspaceProjects();
  const allProjects = [rootDir, ...workspaceProjects];
  const uniqueProjects = Array.from(new Set(allProjects));

  if (isWorkspace || (uniqueProjects.length > 1 && !isFast)) {
    console.log(`${colors.cyan}Detected ${uniqueProjects.length} project(s) in workspace.${colors.reset}`);
    let allPassed = true;
    for (const proj of uniqueProjects) {
      const projLabel = path.relative(rootDir, proj) || 'procapex (root)';
      const passed = runQualityCheckForProject(proj, projLabel);
      if (!passed) {
        allPassed = false;
        break;
      }
    }
    const totalElapsed = ((Date.now() - overallStart) / 1000).toFixed(2);
    if (!allPassed) {
      logError(`Workspace Quality Checks FAILED after ${totalElapsed}s.`);
      process.exit(1);
    }
    logSuccess(`All workspace projects PASSED quality checks in ${totalElapsed}s!`);
    process.exit(0);
  } else {
    // Single project execution
    const passed = runQualityCheckForProject(rootDir, 'procapex');
    const totalElapsed = ((Date.now() - overallStart) / 1000).toFixed(2);
    if (!passed) {
      logError(`Quality Checks FAILED after ${totalElapsed}s.`);
      process.exit(1);
    }
    logSuccess(`All Quality Checks PASSED in ${totalElapsed}s!`);
    process.exit(0);
  }
}

main();
