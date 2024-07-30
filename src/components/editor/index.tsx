"use client"

import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  type JSONContent,
} from "novel"

import { useState } from "react"
import { ImageResizer, handleCommandNavigation } from "novel/extensions"
import { handleImageDrop, handleImagePaste } from "novel/plugins"

import { defaultExtensions } from "./extensions"
import { uploadFn } from "./image-upload"
import { Separator } from "../ui/separator"
import { slashCommand, suggestionItems } from "./slash-command"

import { cn } from "@/utils"
import { ColorSelector } from "./selectors/color-selector"
import { LinkSelector } from "./selectors/link-selector"
import { NodeSelector } from "./selectors/node-selector"
import { TextButtons } from "./selectors/text-buttons"

const extensions = [...defaultExtensions, slashCommand]

type EditorProps = {
  editable: boolean
  disabled?: boolean
  initialValue?: JSONContent
  onValueChange?: (_data: string) => void
}

export default function Editor({
  editable,
  disabled,
  initialValue,
  onValueChange,
}: EditorProps) {
  const [openNode, setOpenNode] = useState(false)
  const [openColor, setOpenColor] = useState(false)
  const [openLink, setOpenLink] = useState(false)

  return (
    <EditorRoot>
      <EditorContent
        editable={editable}
        initialContent={initialValue}
        extensions={extensions}
        className={cn(
          "relative w-full rounded-md",
          disabled && "pointer-events-none opacity-50",
          editable &&
            "min-h-[500px] border border-input bg-input/50 sm:mb-[calc(20vh)]",
        )}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) =>
            handleImageDrop(view, event, moved, uploadFn),
          attributes: {
            class:
              "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
          },
        }}
        onUpdate={({ editor }) => {
          const data = editor.getJSON()
          onValueChange?.(JSON.stringify(data))
        }}
        slotAfter={editable ? <ImageResizer /> : undefined}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val)}
                className="flex w-full cursor-pointer items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <EditorBubble className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl">
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <Separator orientation="vertical" />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <Separator orientation="vertical" />
          <TextButtons />
          <Separator orientation="vertical" />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  )
}
