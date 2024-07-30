import { create } from "zustand"

type ActiveTab = "profile" | "password" | string

type UpdateUserModalStore = {
  activeTab: ActiveTab
  setActiveTab: (_t: ActiveTab) => void
  isOpen: boolean
  onOpen: (_t: ActiveTab) => void
  onOpenChange: (_open: boolean) => void
}

export const useUpdateUserModal = create<UpdateUserModalStore>((set) => ({
  isOpen: false,
  onOpen: (activeTab) => set({ isOpen: true, activeTab }),
  onOpenChange: (open) => set({ isOpen: open }),
  activeTab: "profile",
  setActiveTab: (activeTab) => set({ activeTab }),
}))
