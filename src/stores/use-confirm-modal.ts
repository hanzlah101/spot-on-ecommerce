import { create } from "zustand"

type ModalData = {
  title?: string
  description: string
  onSuccess?: () => void
  onConfirm: () => Promise<any>
}

type ConfirmModalStore = {
  data: ModalData
  isOpen: boolean
  onOpen: (_data?: ModalData) => void
  onClose: () => void
  onOpenChange: (_open: boolean) => void
}

export const useConfirmModal = create<ConfirmModalStore>((set) => ({
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false }),
  onOpenChange: (open) => set({ isOpen: open }),
  data: {
    title: "",
    description: "",
    onConfirm: async () => {},
    onSuccess: () => {},
  },
}))
