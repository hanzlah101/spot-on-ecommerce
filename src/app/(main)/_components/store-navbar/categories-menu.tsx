"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { cn } from "@/utils"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import type { getCategories, getSubcategories } from "@/queries/category"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type CategoriesMenuProps = {
  categoriesPromise: ReturnType<typeof getCategories>
  subcategoriesPromise: ReturnType<typeof getSubcategories>
}

export function DesktopCategoriesMenu({
  categoriesPromise,
  subcategoriesPromise,
}: CategoriesMenuProps) {
  const categories = React.use(categoriesPromise)
  const subcategories = React.use(subcategoriesPromise)

  const subcategoriesByCategoryId = React.useCallback(
    (categoryId: string) => {
      return subcategories.filter((s) => s.categoryId === categoryId)
    },
    [subcategories],
  )

  return (
    <NavigationMenu className="mx-auto hidden pb-2 lg:block">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Lobby</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 lg:w-[550px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    href="/"
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  >
                    <Logo className="size-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">Back Up</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Your one-stop shop for a diverse range of quality
                      products.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/search" title="Products">
                All the products we have to offer.
              </ListItem>
              <ListItem href="/orders" title="Orders">
                List of your orders.
              </ListItem>
              <ListItem href="/blog" title="Blog">
                Read out latest blogs.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {categories.map((cat) => {
          const subcats = subcategoriesByCategoryId(cat.id)

          return (
            <NavigationMenuItem key={cat.id}>
              <NavigationMenuTrigger>{cat.name}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 lg:w-[550px] lg:grid-cols-[.75fr_1fr]">
                  <ListItem
                    title={cat.name}
                    href={`/search?categoryId=${cat.id}`}
                  >
                    {cat.description}
                  </ListItem>
                  {subcats.map((subcat) => (
                    <ListItem
                      href={`/search?subcategoryId=${subcat.id}`}
                      key={subcat.id}
                      title={subcat.name}
                    >
                      {subcat.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function MobileCategoriesMenu({
  categoriesPromise,
  subcategoriesPromise,
}: CategoriesMenuProps) {
  const categories = React.use(categoriesPromise)
  const subcategories = React.use(subcategoriesPromise)

  const subcategoriesByCategoryId = React.useCallback(
    (categoryId: string) => {
      return subcategories.filter((s) => s.categoryId === categoryId)
    },
    [subcategories],
  )

  return (
    <Sheet>
      <SheetTrigger className="mr-4 text-foreground/80 transition-colors hover:text-foreground lg:hidden">
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side={"left"} className="lg:hidden">
        <SheetHeader>
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <Accordion type="multiple" className="w-full">
            {categories.map((cat) => {
              const subcats = subcategoriesByCategoryId(cat.id)

              return (
                <AccordionItem value={cat.id} key={cat.id}>
                  <AccordionTrigger>{cat.name}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3">
                      <li>
                        <Link
                          href={`/search?categoryId=${cat.id}`}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {cat.name}
                        </Link>
                      </li>
                      {subcats.map((subcat) => (
                        <li key={subcat.id}>
                          <Link
                            href={`/search?subcategoryId=${subcat.id}`}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {subcat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
          <div className="mt-5">
            <ThemeToggle />
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
