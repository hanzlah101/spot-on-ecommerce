import { create } from "zustand"

type ScreenSize = "mobile" | "desktop"

type SidebarStore = {
  isOpen: boolean
  screenSize: ScreenSize
  onOpen: (_s: ScreenSize) => void
  onOpenChange: (_open: boolean, _s: ScreenSize) => void
}

export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: false,
  screenSize: "desktop",
  onOpen: (screenSize) => set({ isOpen: true, screenSize }),
  onOpenChange: (isOpen, screenSize) => set({ isOpen, screenSize }),
}))
