#!/usr/bin/env node
/* eslint-env node */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');

// Read package.json
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Extract version parts and suffix
const versionMatch = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
if (!versionMatch) {
  console.error('Invalid version format:', currentVersion);
  process.exit(1);
}

const [, major, minor, patch, suffix] = versionMatch;
const hasBetaSuffix = suffix === '-beta' || suffix.startsWith('-beta');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt user for version bump type
console.log(`\nCurrent version: ${currentVersion}`);
console.log('Select version bump type:');
console.log('1. Major (x.0.0)');
console.log('2. Minor (0.x.0)');
console.log('3. Patch (0.0.x)');
console.log('4. Skip version bump');

rl.question('\nEnter choice (1-4): ', (answer) => {
  rl.close();
  
  let newMajor = parseInt(major);
  let newMinor = parseInt(minor);
  let newPatch = parseInt(patch);
  
  switch (answer.trim()) {
    case '1':
      newMajor += 1;
      newMinor = 0;
      newPatch = 0;
      break;
    case '2':
      newMinor += 1;
      newPatch = 0;
      break;
    case '3':
      newPatch += 1;
      break;
    case '4':
      console.log('Version bump skipped.');
      process.exit(0);
      break;
    default:
      console.error('Invalid choice. Version bump skipped.');
      process.exit(0);
  }
  
  // Preserve the -beta suffix
  const newVersion = `${newMajor}.${newMinor}.${newPatch}${hasBetaSuffix ? '-beta' : ''}`;
  
  // Update package.json
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
  
  console.log(`\n✓ Version updated: ${currentVersion} → ${newVersion}`);
  console.log('Don\'t forget to commit the package.json change!\n');
});

