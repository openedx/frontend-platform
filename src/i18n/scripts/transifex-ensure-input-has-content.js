#!/usr/bin/env node

const fs = require('fs');

const jsonFilePath = process.argv[2];

process.stdout.write(`Ensuring ${jsonFilePath} is not empty...`);

const jsonContent = fs.readFileSync(jsonFilePath, { encoding: 'utf-8' });
const content = JSON.parse(jsonContent);
const isEmpty = Object.keys(content).length === 0;

if (isEmpty) {
  process.stdout.write(`Error: ${jsonFilePath} is empty\n`);
  process.exitCode = 1;
}
