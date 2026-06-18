import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const manualChunkGroups: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router-dom'],
  adminUi: [
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    'tss-react',
    'react-admin',
    'ra-core',
    '@react-admin/ra-rbac',
    '@react-admin/ra-navigation',
    '@react-admin/ra-relationships',
    '@react-admin/ra-editable-datagrid',
  ],
  forms: ['final-form', 'final-form-arrays', 'react-final-form'],
  editor: ['ra-input-rich-text'],
};

const getManualChunk = (id: string) => {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  return Object.entries(manualChunkGroups).find(([, packages]) =>
    packages.some((packageName) =>
      id.includes(`/node_modules/${packageName}/`)
    )
  )?.[0];
};

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  envPrefix: ['VITE_', 'REACT_APP_', 'AUTH_'],
  resolve: {
    alias: {
      '@mui/icons-material': '@mui/icons-material/esm',
    },
  },
  server: {
    port: 3000,
    allowedHosts: ['host.docker.internal', 'localhost', 'nomos-frontend'],
    proxy: {
      '/api': {
        target: 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    allowedHosts: ['nomos-frontend', 'nomo-test.bio.wa.gov.au', 'nomos.bio.wa.gov.au', 'flux.bdr.wa.gov.au', 'helios.bio.wa.gov.au'],
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
    server: {
      deps: {
        inline: [
          'react-admin',
          'ra-core',
          'ra-ui-materialui',
          '@react-admin/ra-rbac',
          '@react-admin/ra-navigation',
          '@react-admin/ra-relationships',
          '@react-admin/ra-editable-datagrid',
          '@mui/material',
          '@mui/icons-material',
        ],
      },
    },
  },
});
