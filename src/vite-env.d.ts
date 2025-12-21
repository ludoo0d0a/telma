/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly BASE_URL: string
  readonly VITE_SHOW_ADS?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

