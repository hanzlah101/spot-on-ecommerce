import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  PackagePlus,
  Shapes,
  GitGraph,
  LucideIcon,
  UserCog,
  Blinds,
  Sparkles,
  ListPlus,
  GitPullRequestCreate,
  TicketPlus,
  TicketPercent,
  KeyRound,
  Sun,
  Moon,
  MonitorSmartphone,
} from "lucide-react"

import type { User } from "@/db/schema"
import { useCategoryModal } from "@/stores/use-category-modal"
import { useSubcategoryModal } from "@/stores/use-subcategory-modal"
import { useVariantModal } from "@/stores/use-variant-modal"
import { useCouponModal } from "@/stores/use-coupon-modal"
import { useUpdateUserModal } from "@/stores/use-update-user-modal"

type SidebarItem = {
  label: string
  href: string
  icon: LucideIcon
  isActive: boolean
}

export function useDashboardSidebarItems(userRole: User["role"]) {
  const pathname = usePathname()

  const items = useMemo(() => {
    const defaultItems = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        isActive: pathname === "/dashboard",
      },
      {
        label: "Orders",
        href: "/dashboard/orders",
        icon: ShoppingCart,
        isActive: pathname.startsWith("/dashboard/orders"),
      },
      {
        label: "Products",
        href: "/dashboard/products",
        icon: Package,
        isActive:
          pathname.startsWith("/dashboard/products") &&
          pathname !== "/dashboard/products/create",
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: Shapes,
        isActive: pathname.startsWith("/dashboard/categories"),
      },
      {
        label: "Subcategories",
        href: "/dashboard/subcategories",
        icon: Blinds,
        isActive: pathname.startsWith("/dashboard/subcategories"),
      },
      {
        label: "Variants",
        href: "/dashboard/variants",
        icon: GitGraph,
        isActive: pathname.startsWith("/dashboard/variants"),
      },
      {
        label: "New Product",
        href: "/dashboard/products/create",
        icon: PackagePlus,
        isActive: pathname === "/dashboard/products/create",
      },
      {
        label: "Discounts",
        href: "/dashboard/coupons",
        icon: TicketPercent,
        isActive: pathname.startsWith("/dashboard/coupons"),
      },
    ]

    if (userRole !== "admin") return defaultItems

    return [
      ...defaultItems,
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: Users,
        isActive: pathname.startsWith("/dashboard/customers"),
      },
      {
        label: "Moderators",
        href: "/dashboard/moderators",
        icon: UserCog,
        isActive: pathname.startsWith("/dashboard/moderators"),
      },
    ] satisfies SidebarItem[]
  }, [pathname, userRole])

  return items
}

export function useDashboardHeaderItems() {
  const router = useRouter()

  const { onOpen: onCategoryOpen } = useCategoryModal()
  const { onOpen: onSubcategoryOpen } = useSubcategoryModal()
  const { onOpen: onVariantOpen } = useVariantModal()
  const { onOpen: onCouponOpen } = useCouponModal()
  const { onOpen: onUpdateProfile } = useUpdateUserModal()

  const { setTheme } = useTheme()

  return {
    dashboard: [
      {
        label: "Dashboard",
        onClick: () => router.push("/dashboard"),
        icon: LayoutDashboard,
      },
    ],
    orders: [
      {
        label: "Orders",
        onClick: () => router.push("/dashboard/orders"),
        icon: ShoppingCart,
      },
    ],
    products: [
      {
        label: "Products",
        onClick: () => router.push("/dashboard/products"),
        icon: Package,
      },
      {
        label: "Create product",
        onClick: () => router.push("/dashboard/products/create"),
        icon: PackagePlus,
      },
    ],
    categories: [
      {
        label: "Categories",
        onClick: () => router.push("/dashboard/categories"),
        icon: Shapes,
      },
      {
        label: "Create category",
        onClick: () => onCategoryOpen(),
        icon: Sparkles,
      },
    ],
    subcategories: [
      {
        label: "Subcategories",
        onClick: () => router.push("/dashboard/subcategories"),
        icon: Blinds,
      },
      {
        label: "Create subcategory",
        onClick: () => onSubcategoryOpen(),
        icon: ListPlus,
      },
    ],
    variants: [
      {
        label: "Variants",
        onClick: () => router.push("/dashboard/variants"),
        icon: GitGraph,
      },
      {
        label: "Create variant",
        onClick: () => onVariantOpen(),
        icon: GitPullRequestCreate,
      },
    ],
    coupons: [
      {
        label: "Discount Codes",
        onClick: () => router.push("/dashboard/coupons"),
        icon: TicketPercent,
      },
      {
        label: "Create discount code",
        onClick: () => onCouponOpen(),
        icon: TicketPlus,
      },
    ],
    profile: [
      {
        label: "Change profile",
        onClick: () => onUpdateProfile("profile"),
        icon: UserCog,
      },
      {
        label: "Change password",
        onClick: () => onUpdateProfile("password"),
        icon: KeyRound,
      },
    ],
    theme: [
      {
        label: "Light",
        onClick: () => setTheme("light"),
        icon: Sun,
      },
      {
        label: "Dark",
        onClick: () => setTheme("dark"),
        icon: Moon,
      },
      {
        label: "System Default",
        onClick: () => setTheme("system"),
        icon: MonitorSmartphone,
      },
    ],
  }
}
