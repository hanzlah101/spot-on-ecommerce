import { create } from "zustand"

type TrackOrderModalStore = {
  isOpen: boolean
  onOpen: () => void
  onOpenChange: (_open: boolean) => void
}

export const useTrackOrderModal = create<TrackOrderModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onOpenChange: (open) => set({ isOpen: open }),
}))
