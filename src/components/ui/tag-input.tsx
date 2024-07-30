import * as React from "react"
import { X } from "lucide-react"

interface TagInputProps {
  disabled?: boolean
  initialKeywords?: string[]
  onKeywordsChange: (_keywords: string[]) => void
}

const TagInput: React.FC<TagInputProps> = ({
  initialKeywords = [],
  onKeywordsChange,
  disabled,
}) => {
  const [inputValue, setInputValue] = React.useState<string>("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (event.key === "Enter" || event.key === ",") &&
      inputValue.trim() !== ""
    ) {
      event.preventDefault()
      const newKeywords = [...initialKeywords, inputValue.trim()]
      const uniqueKeywords = newKeywords.filter(
        (item, index) => newKeywords.indexOf(item) === index,
      )
      onKeywordsChange(uniqueKeywords)
      setInputValue("")
    } else if (event.key === "Backspace" && inputValue === "") {
      event.preventDefault()
      const newKeywords = initialKeywords.slice(0, -1)
      onKeywordsChange(newKeywords)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const paste = event.clipboardData.getData("text")
    const keywordsToAdd = paste
      .split(/[\n\t,]+/)
      .map((keyword) => keyword.trim())
      .filter(Boolean)
    if (keywordsToAdd.length) {
      const newKeywords = [...initialKeywords, ...keywordsToAdd]
      const uniqueKeywords = newKeywords.filter(
        (item, index) => newKeywords.indexOf(item) === index,
      )

      onKeywordsChange(uniqueKeywords)
      setInputValue("")
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (inputValue.trim() !== "" && event.relatedTarget?.tagName !== "BUTTON") {
      const newKeywords = [...initialKeywords, inputValue.trim()]
      const uniqueKeywords = newKeywords.filter(
        (item, index) => newKeywords.indexOf(item) === index,
      )
      onKeywordsChange(uniqueKeywords)
      setInputValue("")
    }
  }

  const removeKeyword = (indexToRemove: number) => {
    const newKeywords = initialKeywords.filter(
      (_, index) => index !== indexToRemove,
    )
    onKeywordsChange(newKeywords)
    inputRef.current?.focus()
  }

  return (
    <div className="group min-h-10 w-full">
      <div className="z-10 flex min-h-10 w-full flex-wrap items-center rounded-md border border-input bg-input/50 px-2.5 py-1 group-focus-within:border-input/50 group-focus-within:ring-2 group-focus-within:ring-foreground/30">
        <div className="flex max-h-[300px] w-full flex-wrap gap-1 overflow-y-auto">
          {initialKeywords.map((keyword, index) => (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => removeKeyword(index)}
              className="flex items-center rounded-sm bg-foreground/10 px-2 py-1 text-xs disabled:pointer-events-none disabled:opacity-50"
            >
              {keyword}
              <X size={14} className="ml-2 cursor-pointer" />
            </button>
          ))}
          <input
            type="text"
            autoFocus
            ref={inputRef}
            disabled={disabled}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={(e) => handleBlur(e)}
            placeholder="Type keyword and press Enter..."
            className="my-1 flex-1 bg-transparent pl-1 text-sm text-foreground outline-none disabled:pointer-events-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  )
}

export { TagInput }
