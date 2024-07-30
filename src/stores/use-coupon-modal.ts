import { create } from "zustand"

import { CouponSchema } from "@/utils/validations/coupon"

type InitialData = CouponSchema & {
  couponId: string
}

type CouponModalStore = {
  initialData?: InitialData
  isOpen: boolean
  onOpen: (_initialData?: InitialData) => void
  onOpenChange: (_open: boolean) => void
}

export const useCouponModal = create<CouponModalStore>((set) => ({
  isOpen: false,
  onOpen: (initialData) => set({ isOpen: true, initialData }),
  onOpenChange: (open) => set({ isOpen: open }),
}))
