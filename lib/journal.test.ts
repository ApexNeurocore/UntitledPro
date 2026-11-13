import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyPassword,
  resolvePasswordAccess,
  formatStoryNumber,
  formatDateBadge,
  parseInlineMediaTokens,
  isBlockedDevShortcut,
  isDevToolsSizeAnomaly,
  getSubThemesForMode,
  getModeForSubTheme,
  computeReadingProgress,
  getPreLoginCopy,
} from './journal';

test('verifyPassword and resolvePasswordAccess distinguish real password (1234) and decoy password (0000)', () => {
  assert.equal(verifyPassword('1234', '1234'), true);
  assert.equal(verifyPassword('  1234  ', '1234'), true);
  assert.equal(verifyPassword('Pragya2026', 'Pragya2026'), true);
  assert.equal(verifyPassword('Pragya ❤️‍🩹', 'Pragya ❤️‍🩹'), true);
  assert.equal(verifyPassword('wrong123', '1234'), false);
  assert.equal(resolvePasswordAccess('1234', '1234', '0000'), 'journal');
  assert.equal(resolvePasswordAccess('0000', '1234', '0000'), 'decoy');
  assert.equal(resolvePasswordAccess('  0000 ', '1234', '0000'), 'decoy');
  assert.equal(resolvePasswordAccess('9999', '1234', '0000'), 'denied');
});

test('getSubThemesForMode and getModeForSubTheme group sub-themes under light and dark', () => {
  const lightThemes = getSubThemesForMode('light');
  const darkThemes = getSubThemesForMode('dark');
  assert.equal(lightThemes.length, 5);
  assert.equal(darkThemes.length, 4);
  assert.equal(getModeForSubTheme('sakura'), 'light');
  assert.equal(getModeForSubTheme('sakura-dark'), 'dark');
  assert.equal(getModeForSubTheme('twilight'), 'dark');
});

test('formatStoryNumber and formatDateBadge format labels properly', () => {
  assert.equal(formatStoryNumber(0), 'No. 01');
  assert.equal(formatStoryNumber(10), 'No. 11');
  assert.equal(formatDateBadge('17 February, 2026'), '✦ 17 February, 2026 ✦');
});

test('parseInlineMediaTokens preserves plain text 100% untouched when no tags exist', () => {
  const original = `First paragraph with emojis 💀❤️‍🩹.\n\nSecond paragraph!`;
  const parsed = parseInlineMediaTokens(original);
  assert.equal(parsed.length, 1);
  assert.deepEqual(parsed[0], { type: 'text', content: original });
});

test('parseInlineMediaTokens parses inline [IMAGE: ...] and [AUDIO: ...] between text', () => {
  const input = `Before text\n[IMAGE: photos/us.jpg | Our first photo]\nMiddle text\n[AUDIO: songs/favourite.mp3 | Our Song]\nAfter text`;
  const parsed = parseInlineMediaTokens(input);
  assert.equal(parsed.length, 5);
  assert.deepEqual(parsed[0], { type: 'text', content: 'Before text\n' });
  assert.deepEqual(parsed[1], { type: 'image', src: 'photos/us.jpg', caption: 'Our first photo' });
  assert.deepEqual(parsed[2], { type: 'text', content: '\nMiddle text\n' });
  assert.deepEqual(parsed[3], { type: 'audio', src: 'songs/favourite.mp3', title: 'Our Song' });
  assert.deepEqual(parsed[4], { type: 'text', content: '\nAfter text' });
});

test('isBlockedDevShortcut detects F1-F12 and all inspect/source/print shortcuts', () => {
  assert.equal(isBlockedDevShortcut('F12', false, false, false), true);
  assert.equal(isBlockedDevShortcut('F1', false, false, false), true);
  assert.equal(isBlockedDevShortcut('F5', false, false, false), true);
  assert.equal(isBlockedDevShortcut('i', true, true, false), true);
  assert.equal(isBlockedDevShortcut('j', true, true, false), true);
  assert.equal(isBlockedDevShortcut('c', true, true, false), true);
  assert.equal(isBlockedDevShortcut('k', true, true, false), true);
  assert.equal(isBlockedDevShortcut('u', true, false, false), true);
  assert.equal(isBlockedDevShortcut('s', true, false, false), true);
  assert.equal(isBlockedDevShortcut('p', true, false, false), true);
  assert.equal(isBlockedDevShortcut('a', false, false, false), false);
  assert.equal(isDevToolsSizeAnomaly(1440, 900, 900, 820), true);
  assert.equal(isDevToolsSizeAnomaly(1440, 1440, 900, 820), false);
});

test('computeReadingProgress calculates clamped percentage from scroll position', () => {
  assert.equal(computeReadingProgress(0, 5000, 1000), 0);
  assert.equal(computeReadingProgress(1000, 5000, 1000), 25);
  assert.equal(computeReadingProgress(2000, 5000, 1000), 50);
  assert.equal(computeReadingProgress(4000, 5000, 1000), 100);
  assert.equal(computeReadingProgress(4500, 5000, 1000), 100);
});

test('getPreLoginCopy contains zero references to love, journal, or hearts', () => {
  const copy = getPreLoginCopy();
  const combined = Object.values(copy).join(' ').toLowerCase();
  assert.equal(combined.includes('love'), false);
  assert.equal(combined.includes('journal'), false);
  assert.equal(combined.includes('heart'), false);
  assert.equal(combined.includes('♥'), false);
});

