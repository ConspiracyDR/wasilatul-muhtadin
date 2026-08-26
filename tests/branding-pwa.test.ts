import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { appConfig } from '../src/config/app-config';

const root = process.cwd();

describe('branding and PWA manifest config', () => {
  it('locks the primary brand color without changing the app name', () => {
    const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');

    expect(appConfig.appName).toBe('Majelis Wasilatul Muhtadin');
    expect(appConfig.themeColor).toBe('#007979');
    expect(tokens).toContain('--color-primary: #007979');
    expect(tokens).toContain('--color-primary-hover');
    expect(tokens).toContain('--color-primary-soft');
  });

  it('keeps installable manifest values and icon references valid', () => {
    const viteConfig = readFileSync(join(root, 'vite.config.ts'), 'utf8');

    expect(appConfig.shortName).toBe('Wasilatul Muhtadin');
    expect(appConfig.backgroundColor).toBe('#f7f4ec');
    expect(viteConfig).toContain("lang: 'id'");
    expect(appConfig.pwaIcons.standard192).toBe('/icons/icon-192.png');
    expect(appConfig.pwaIcons.standard512).toBe('/icons/icon-512.png');
    expect(appConfig.pwaIcons.maskable192).toBe('/icons/maskable-icon-192.png');
    expect(appConfig.pwaIcons.maskable512).toBe('/icons/maskable-icon-512.png');
  });

  it('has local logo, favicon, apple touch, standard, and maskable icon assets', () => {
    const icons = [
      appConfig.logoPath,
      appConfig.faviconPath,
      appConfig.appleTouchIconPath,
      appConfig.pwaIcons.standard192,
      appConfig.pwaIcons.standard512,
      appConfig.pwaIcons.maskable192,
      appConfig.pwaIcons.maskable512,
    ];

    icons.forEach((iconPath) => {
      const filePath = join(root, 'public', iconPath.replace(/^\//, ''));
      expect(existsSync(filePath), iconPath).toBe(true);
      expect(readFileSync(filePath).length, iconPath).toBeGreaterThan(0);
    });

    expect(readPngSize('public/icons/icon-192.png')).toEqual({ width: 192, height: 192 });
    expect(readPngSize('public/icons/icon-512.png')).toEqual({ width: 512, height: 512 });
    expect(readPngSize('public/icons/maskable-icon-192.png')).toEqual({ width: 192, height: 192 });
    expect(readPngSize('public/icons/maskable-icon-512.png')).toEqual({ width: 512, height: 512 });
  });
});

function readPngSize(path: string) {
  const buffer = readFileSync(join(root, path));
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}
