import { Button } from "@/components/ui/button"
import { PopoverContent } from "@/components/ui/popover"
import { cn } from "@/utils"
import { Popover, PopoverTrigger } from "@radix-ui/react-popover"
import { Check, Trash } from "lucide-react"
import { useEditor } from "novel"
import { useEffect, useRef, useState } from "react"

export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch (_e) {
    return false
  }
}
export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString()
    }
  } catch (_e) {
    return null
  }
}
interface LinkSelectorProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
}

export const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
  const { editor } = useEditor()

  const [value, setVaue] = useState(editor?.getAttributes("link").href || "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const defaultHref = editor?.getAttributes("link").href

  useEffect(() => {
    setVaue(defaultHref)
  }, [defaultHref, editor])

  if (!editor) return null

  function handleOpenChange(open: boolean) {
    if (!open) setVaue("")
    onOpenChange(open)
  }

  function handleSubmit() {
    const url = getUrlFromString(value)
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
      onOpenChange(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim() !== "") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Popover modal={true} open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 rounded-none border-none"
        >
          <p className="text-base">↗</p>
          <p
            className={cn("underline decoration-stone-400 underline-offset-4", {
              "text-blue-500": editor.isActive("link"),
            })}
          >
            Link
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
        <div className="flex p-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setVaue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a link"
            className="flex-1 bg-background p-1 text-sm outline-none"
          />
          {editor.getAttributes("link").href ? (
            <Button
              size="icon"
              variant="outline"
              className="flex h-8 items-center rounded-sm p-1 text-destructive transition-all hover:bg-destructive/80 hover:text-destructive-foreground"
              onClick={() => {
                editor.chain().focus().unsetLink().run()
                if (inputRef.current) {
                  inputRef.current.value = ""
                }
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSubmit}
              className="h-8"
              form="editor-link-form"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
