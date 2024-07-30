import type { PropsWithChildren } from "react"

import { verifyAdmin } from "@/utils/auth"
import { Sidebar } from "./_components/sidebar"
import { CategoryModal } from "./_components/modals/category-modal"
import { SubategoryModal } from "./_components/modals/subcategory-modal"
import { VariantModal } from "./_components/modals/variant-modal"
import { CouponModal } from "./_components/modals/coupon-modal"
import { DashboardHeader } from "./_components/dashboard-header"

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const { user } = await verifyAdmin()

  return (
    <>
      <>
        <Sidebar userRole={user.role} />
        <DashboardHeader />
        <div className="mb-6 mt-[78px] w-full px-4 transition-[margin] duration-300 md:ml-[60px] md:w-[calc(100vw-60px)] lg:px-10">
          {children}
        </div>
      </>
      <CategoryModal />
      <SubategoryModal />
      <VariantModal />
      <CouponModal />
    </>
  )
}
