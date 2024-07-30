"use client"

import { useEffect, useRef, useState } from "react"
import { Menu } from "lucide-react"

import { cn } from "@/utils"
import { useSidebar } from "@/stores/use-sidebar"
import { useClickOutside } from "@/hooks/use-click-outside"
import { ThemeToggleDropdown } from "@/components/theme-toggle"
import { useDashboardHeaderItems } from "@/hooks/use-dashboard-items"
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command"
import { useScrollLock } from "@/hooks/use-scroll-lock"

export function DashboardHeader() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const commandRef = useClickOutside(() => setOpen(false))
  const inputRef = useRef<HTMLInputElement>(null)

  const { onOpen } = useSidebar()
  const items = useDashboardHeaderItems()

  const { lockScroll, allowScroll } = useScrollLock()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
        if (!open) {
          inputRef.current?.focus()
        } else {
          inputRef.current?.blur()
        }
      }

      if (e.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  useEffect(() => {
    if (open) {
      lockScroll()
    } else {
      allowScroll()
    }
  }, [open, lockScroll, allowScroll])

  useEffect(() => {
    if (value) setOpen(true)
  }, [value])

  return (
    <header className="fixed right-0 top-0 z-30 flex h-16 w-full items-center justify-between gap-x-5 bg-muted/50 px-4 backdrop-blur-md md:max-w-[calc(100vw-60px)] md:px-12">
      <div className="flex w-full items-center gap-x-3">
        <Menu
          className="size-5 shrink-0 cursor-pointer md:hidden"
          onClick={() => onOpen("mobile")}
        />
        <Command
          ref={commandRef}
          className="h-auto max-w-[500px] bg-transparent"
          onClick={() => {
            if (!open) setOpen(true)
          }}
        >
          <CommandInput
            ref={inputRef}
            placeholder="Search"
            className="h-10"
            value={value}
            onValueChange={setValue}
            wrapperClassName={cn(
              "group border-b-0 transition-colors rounded-md hover:bg-input/70 focus-within:bg-input/70 bg-transparent",
              { "bg-input/70": open },
            )}
          >
            <CommandShortcut
              className={cn("opacity-0 transition-opacity", {
                "group-hover:opacity-100": !open,
              })}
            >
              ⌘K
            </CommandShortcut>
          </CommandInput>
          <CommandList
            className={cn(
              "fixed left-4 top-14 w-full max-w-[calc(100vw-2rem)] rounded-lg border bg-[#f9f9fa] shadow-lg dark:bg-[#18171a] md:left-12 md:max-w-[500px]",
              open ? "block" : "hidden",
            )}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(items).map(([key, values]) => (
              <CommandGroup
                key={key}
                heading={key[0]?.toUpperCase() + key.slice(1)}
              >
                {values.map((item, index) => (
                  <CommandItem
                    className="cursor-pointer py-2"
                    key={item.label + index}
                    onSelect={() => {
                      item.onClick()
                      setOpen(false)
                      inputRef.current?.blur()
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </div>

      <ThemeToggleDropdown className="flex" />
    </header>
  )
}
