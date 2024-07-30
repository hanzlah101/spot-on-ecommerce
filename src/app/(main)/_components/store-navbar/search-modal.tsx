"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

import { useSearchProducts } from "@/hooks/use-search-products"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SearchModal() {
  const [open, setOpen] = useState(false)

  const { inputValue, handleInputChange, handleSubmit } = useSearchProducts()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="text-foreground transition-transform hover:scale-110"
        aria-label="Search Products"
      >
        <Tooltip delayDuration={250}>
          <TooltipTrigger asChild>
            <Search className="size-5" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            Search
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        style={{ animationDuration: "0.3s" }}
        className="top-0 h-20 max-w-full translate-y-0 rounded-none px-6 data-[state=closed]:slide-out-to-top-20 data-[state=open]:slide-in-from-top-20 sm:rounded-none"
      >
        <form
          className="flex h-full items-center justify-between gap-x-5"
          onSubmit={(e) => {
            handleSubmit(e)
            setOpen(false)
          }}
        >
          <button
            type="submit"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-5 shrink-0" />
          </button>
          <input
            autoFocus
            value={inputValue}
            placeholder="Search Products..."
            onChange={handleInputChange}
            className="w-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
          <DialogClose>
            <X className="size-5 shrink-0 text-muted-foreground transition-colors hover:text-foreground" />
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>
  )
}
