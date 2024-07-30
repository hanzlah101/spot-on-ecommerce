import {
  Archive,
  Ban,
  DiamondPlus,
  Gem,
  LucideIcon,
  MonitorUp,
  Timer,
} from "lucide-react"

import { productLabelEnum, productStatusEnum } from "@/db/schema"

type ProductStatusItem = {
  label: string
  description: string
  icon: LucideIcon
  value: (typeof productStatusEnum.enumValues)[number]
}

export const productStatusItems: ProductStatusItem[] = [
  {
    label: "Draft",
    value: "draft",
    description: "Needs further review and refinement",
    icon: Timer,
  },
  {
    label: "Archived",
    value: "archived",
    description: "No longer active or available for public access",
    icon: Archive,
  },
  {
    label: "Active",
    value: "active",
    description: "Approved and publicly available for customers",
    icon: MonitorUp,
  },
]

type ProductLabelItem = {
  label: string
  description: string
  icon: LucideIcon
  value: (typeof productLabelEnum.enumValues)[number]
}

export const productLabelItems: ProductLabelItem[] = [
  {
    label: "Featured",
    value: "featured",
    description: "Highlights the product on the main page",
    icon: Gem,
  },
  {
    label: "New Arrival",
    value: "new arrival",
    description: "Displays this product in the new arrivals section",
    icon: DiamondPlus,
  },
  {
    label: "None",
    value: "none",
    description: "Ensure the product has no specific labels",
    icon: Ban,
  },
]

export const SEARCH_PRODUCTS_LIMIT = 24
