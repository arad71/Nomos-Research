/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_BASE_URL?: string;
  readonly REACT_APP_BACKEND_URL?: string;
  readonly REACT_APP_AUTH_PROVIDER?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
