import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const background = readFileSync(join(root, 'background.js'), 'utf8');

test('manifest is version 3 with a semantic version string', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.match(manifest.version, /^\d+(\.\d+){1,3}$/);
});

test('extension never asks for all sites or tab history', () => {
  const raw = JSON.stringify(manifest);
  assert.ok(!raw.includes('<all_urls>'));
  assert.ok(!raw.includes('*://*/*'));
  assert.ok(!manifest.permissions.includes('tabs'));
});

test('every referenced file exists', () => {
  const files = [
    manifest.background.service_worker,
    manifest.action.default_popup,
    manifest.options_page,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    ...manifest.content_scripts.flatMap(cs => cs.js)
  ];
  for (const f of files) assert.ok(existsSync(join(root, f)), `${f} is missing`);
});

test('every site match is https and specific', () => {
  const patterns = [...manifest.host_permissions, ...manifest.content_scripts.flatMap(cs => cs.matches)];
  for (const p of patterns) {
    assert.ok(p.startsWith('https://'), `${p} is not https`);
    assert.ok(!p.startsWith('https://*/'), `${p} matches every host`);
  }
});

test('the proxy the background script calls is an allowed host', () => {
  const url = background.match(/PROXY_URL = "([^"]+)"/)[1];
  const origin = new URL(url).origin;
  assert.ok(manifest.host_permissions.includes(origin + '/*'));
});

test('keyboard command is declared with a default shortcut', () => {
  const cmd = manifest.commands['fix-grammar'];
  assert.ok(cmd);
  assert.ok(cmd.suggested_key.default);
  assert.ok(background.includes('"fix-grammar"'));
});

test('every script parses', () => {
  const scripts = ['background.js', 'content-script.js', 'shared.js', 'popup.js', 'options.js', 'proxy/api/grammar.js', ...manifest.content_scripts.flatMap(cs => cs.js)];
  for (const f of new Set(scripts)) {
    execFileSync(process.execPath, ['--check', join(root, f)], { stdio: 'pipe' });
  }
});

test('the page injection function is self-contained and parses', () => {
  const start = background.indexOf('func: ');
  const end = background.indexOf('args: [correctedText, text]');
  assert.ok(start > 0 && end > start);
  let fn = background.slice(start + 'func: '.length, end).trim().replace(/,$/, '');
  const compiled = new Function('return ' + fn)();
  assert.equal(typeof compiled, 'function');
  assert.equal(compiled.length, 2);
  assert.ok(!fn.includes('chrome.'), 'injected code cannot use extension APIs');
});

test('popup and options read the version from the manifest', () => {
  for (const f of ['popup.html', 'options.html']) {
    assert.ok(!readFileSync(join(root, f), 'utf8').includes('v' + manifest.version), `${f} hard-codes the version`);
  }
  for (const f of ['popup.js', 'options.js']) {
    assert.ok(readFileSync(join(root, f), 'utf8').includes('getManifest().version'), `${f} does not read the manifest version`);
  }
});

test('help links point at the repository, not a profile', () => {
  for (const f of ['popup.html', 'popup.js', 'options.html', 'options.js', 'shared.js']) {
    const src = readFileSync(join(root, f), 'utf8');
    for (const url of src.match(/https:\/\/github\.com\/[^\s'"<]+/g) || []) {
      assert.ok(url.startsWith('https://github.com/Saleep24/MrGrammar'), `${f} links to ${url}`);
    }
  }
});

test('every script a page loads exists and ships in the store zip', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts.package;
  for (const page of [manifest.action.default_popup, manifest.options_page]) {
    const html = readFileSync(join(root, page), 'utf8');
    for (const [, src] of html.matchAll(/<script src="([^"]+)"/g)) {
      assert.ok(existsSync(join(root, src)), `${page} loads missing ${src}`);
      assert.ok(pkg.includes(' ' + src + ' '), `${src} is not in the package script`);
    }
  }
});
