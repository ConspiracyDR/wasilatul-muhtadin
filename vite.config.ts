import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import { appConfig } from './src/config/app-config';
import { validateReadingDocument } from './src/content/validate';

const contentRoot = join(process.cwd(), 'src', 'content');

function collectJsonFiles(directory: string): string[] {
  try {
    return readdirSync(directory).flatMap((entry) => {
      const fullPath = join(directory, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        return collectJsonFiles(fullPath);
      }
      return entry.endsWith('.json') ? [fullPath] : [];
    });
  } catch {
    return [];
  }
}

function productionContentGuard(): Plugin {
  return {
    name: 'production-content-guard',
    buildStart() {
      const files = collectJsonFiles(contentRoot);
      const errors = files.flatMap((file) => {
        const raw = JSON.parse(readFileSync(file, 'utf8'));
        const result = validateReadingDocument(raw, { requireApproved: true });
        return result.ok ? [] : result.errors.map((error) => `${file}: ${error}`);
      });

      if (errors.length > 0) {
        throw new Error(
          `Production content validation failed:\n${errors.join('\n')}`,
        );
      }
    },
    apply: 'build',
  };
}

function htmlBranding(): Plugin {
  return {
    name: 'html-branding',
    transformIndexHtml(html) {
      return html
        .replaceAll('__APP_NAME__', appConfig.appName)
        .replaceAll('__APP_DESCRIPTION__', appConfig.description)
        .replaceAll('__APP_THEME_COLOR__', appConfig.themeColor)
        .replaceAll('__APP_FAVICON__', appConfig.faviconPath)
        .replaceAll('__APP_APPLE_TOUCH_ICON__', appConfig.appleTouchIconPath);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    htmlBranding(),
    productionContentGuard(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        appConfig.logoPath.slice(1),
        appConfig.faviconPath.slice(1),
        appConfig.appleTouchIconPath.slice(1),
      ],
      manifest: {
        name: appConfig.appName,
        short_name: appConfig.shortName,
        description: appConfig.description,
        theme_color: appConfig.themeColor,
        background_color: appConfig.backgroundColor,
        display: 'standalone',
        lang: 'id',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: appConfig.pwaIcons.standard192,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: appConfig.pwaIcons.standard512,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: appConfig.pwaIcons.maskable192,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: appConfig.pwaIcons.maskable512,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/firestore-rules.test.ts'],
    setupFiles: './tests/setup.ts',
  },
});
