import { create } from "zustand"

interface Config {
  theme: {
    primary: string
    secondary: string
    muted: string
  }
}

interface ConfigStore {
  config: Config
  setConfig: (config: Config) => void
}

export const useConfig = create<ConfigStore>((set) => ({
  config: {
    theme: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      muted: "hsl(var(--muted))",
    },
  },
  setConfig: (config) => set({ config }),
}))

