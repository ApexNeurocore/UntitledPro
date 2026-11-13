export interface StoryEntry {
  date: string;
  title: string;
  content: string;
}

export type ThemeMode = 'light' | 'dark';

export interface SubThemeInfo {
  id: string;
  name: string;
  mode: ThemeMode;
}

export const SUB_THEMES: SubThemeInfo[] = [
  { id: 'linen', name: 'Morning Linen', mode: 'light' },
  { id: 'sakura', name: 'Sakura Mist', mode: 'light' },
  { id: 'matcha', name: 'Matcha Kyoto', mode: 'light' },
  { id: 'nordic', name: 'Nordic Cloud', mode: 'light' },
  { id: 'parchment', name: 'Warm Parchment', mode: 'light' },
  { id: 'twilight', name: 'Velvet Twilight', mode: 'dark' },
  { id: 'sakura-dark', name: 'Sakura Nocturne', mode: 'dark' },
  { id: 'matcha-dark', name: 'Matcha Midnight', mode: 'dark' },
  { id: 'nordic-dark', name: 'Nordic Aurora', mode: 'dark' },
];

export function getSubThemesForMode(mode: ThemeMode): SubThemeInfo[] {
  return SUB_THEMES.filter((t) => t.mode === mode);
}

export function getModeForSubTheme(subThemeId: string): ThemeMode {
  const found = SUB_THEMES.find((t) => t.id === subThemeId);
  return found ? found.mode : 'light';
}

export type ContentSegment =
  | { type: 'text'; content: string }
  | { type: 'image'; src: string; caption: string }
  | { type: 'audio'; src: string; title: string };

export type AccessMode = 'journal' | 'decoy' | 'denied';

export function verifyPassword(entered: string, expected: string): boolean {
  return entered.trim() === expected;
}

export function resolvePasswordAccess(
  entered: string,
  realPassword: string,
  decoyPassword = '0000'
): AccessMode {
  const clean = entered.trim();
  if (clean === realPassword) return 'journal';
  if (clean === decoyPassword) return 'decoy';
  return 'denied';
}


export function formatStoryNumber(index: number): string {
  return `No. ${String(index + 1).padStart(2, '0')}`;
}

export function formatDateBadge(date: string): string {
  return `✦ ${date} ✦`;
}

/**
 * Parses inline [IMAGE: url | optional caption] and [AUDIO: url | optional title]
 * shortcodes inside a story's content string while keeping all surrounding text
 * segments 100% untouched byte-for-byte.
 */
export function parseInlineMediaTokens(rawContent: string): ContentSegment[] {
  const tokenRegex = /\[(IMAGE|AUDIO)\s*:\s*([^\]|]+?)(?:\s*\|\s*([^\]]*?))?\s*\]/gi;
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(rawContent)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: rawContent.slice(lastIndex, match.index),
      });
    }

    const kind = match[1].toUpperCase();
    const src = match[2].trim();
    const label = (match[3] || '').trim();

    if (kind === 'IMAGE') {
      segments.push({
        type: 'image',
        src,
        caption: label,
      });
    } else if (kind === 'AUDIO') {
      segments.push({
        type: 'audio',
        src,
        title: label || 'Audio Memory',
      });
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < rawContent.length || segments.length === 0) {
    segments.push({
      type: 'text',
      content: rawContent.slice(lastIndex),
    });
  }

  return segments;
}

export function isBlockedDevShortcut(key: string, ctrlOrMeta: boolean, shiftKey: boolean, altKey: boolean): boolean {
  const upperKey = (key || '').toUpperCase();
  if (/^F([1-9]|1[0-2])$/.test(upperKey)) return true;
  const devKeys = ['I', 'J', 'C', 'K', 'E', 'M', 'P'];
  if (ctrlOrMeta && shiftKey && devKeys.includes(upperKey)) return true;
  if (ctrlOrMeta && altKey && (devKeys.includes(upperKey) || upperKey === 'U')) return true;
  if (ctrlOrMeta && (upperKey === 'U' || upperKey === 'S' || upperKey === 'P')) return true;
  return false;
}

export function isDevToolsSizeAnomaly(
  outerWidth: number,
  innerWidth: number,
  outerHeight: number,
  innerHeight: number,
  threshold = 170
): boolean {
  if (!outerWidth || !innerWidth || !outerHeight || !innerHeight) return false;
  return (outerWidth - innerWidth > threshold) || (outerHeight - innerHeight > threshold);
}


export function computeReadingProgress(scrollY: number, scrollHeight: number, clientHeight: number): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return scrollY > 0 ? 100 : 0;
  const rawPct = (scrollY / maxScroll) * 100;
  return Math.min(100, Math.max(0, Math.round(rawPct)));
}

export function getPreLoginCopy() {
  return {
    loaderTitle: 'Protected Portal',
    loaderStatus: 'Initializing secure environment…',
    kicker: 'Restricted Access',
    title: 'Authentication Required',
    subtitle: 'Please enter your alphanumeric passcode to continue',
    button: 'Continue →',
    error: 'Invalid passcode. Please try again.',
    note: 'End-to-end protected session · Alphanumeric passcode required',
  };
}

