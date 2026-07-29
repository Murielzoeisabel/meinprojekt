const test = require('node:test');
const assert = require('node:assert/strict');
const { getNpmCommand } = require('./deploy-build');

test('uses npm on non-Windows platforms', () => {
  const originalPlatform = process.platform;
  Object.defineProperty(process, 'platform', { value: 'linux' });

  try {
    assert.equal(getNpmCommand(), 'npm');
  } finally {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  }
});

test('uses npm.cmd on Windows', () => {
  const originalPlatform = process.platform;
  Object.defineProperty(process, 'platform', { value: 'win32' });

  try {
    assert.equal(getNpmCommand(), 'npm.cmd');
  } finally {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  }
});
