import { Logo } from "@/components/logo"
import { getCategories, getSubcategories } from "@/queries/category"
import { ThemeToggleDropdown } from "@/components/theme-toggle"
import { getSession } from "@/utils/auth"

import { AnnouncementBar } from "./announcement-bar"
import { MobileCategoriesMenu } from "./categories-menu"
import { SearchModal } from "./search-modal"
import { CartTrigger } from "./cart-trigger"
import { UserMenu } from "./user-menu"

export async function StoreNavbar() {
  const categoriesPromise = getCategories()
  const subcategoriesPromise = getSubcategories()

  const { user } = await getSession()

  return (
    <>
      <AnnouncementBar />
      <nav className="sticky inset-x-0 top-0 z-50 flex w-full shrink-0 items-center bg-background/65 px-4 backdrop-blur-lg md:px-10">
        <MobileCategoriesMenu
          categoriesPromise={categoriesPromise}
          subcategoriesPromise={subcategoriesPromise}
        />
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center gap-x-4">
            <ThemeToggleDropdown />
            <SearchModal />
          </div>

          <Logo className="mx-auto" />
          <div className="flex items-center justify-end gap-x-4">
            <UserMenu user={user} />
            <CartTrigger />
          </div>
        </div>
      </nav>
    </>
  )
}
