"use client"

// TODO: Image actions

import Image from "next/image"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Check, ImageOff, Upload, X } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { closestCorners } from "@dnd-kit/core"

import { cn } from "@/utils"
import { getImages } from "@/queries/product"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/ui/file-uploader"
import { useIntersectionObserver } from "@/hooks/use-intersection-oberver"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ImageSchema } from "@/utils/validations/image"
import type { ProductImageSchema } from "@/utils/validations/product"
import { Sortable, SortableItem } from "@/components/ui/sortable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog"

type ImageSelectProps = {
  disabled?: boolean
  onChange: (_data: ProductImageSchema[]) => void
  value: ProductImageSchema[]
  multiple?: boolean
}

export function ImageSelect({ disabled, value, onChange }: ImageSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("library")
  const [selectedImages, setSelectedImages] = useState<ImageSchema[]>([])

  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.7,
  })

  const {
    data,
    isFetching,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["library-images"],
    queryFn: async ({ pageParam }) => await getImages(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : null,
  })

  const libraryImages = useMemo(() => {
    if (!data) return []
    return data?.pages
      .flatMap((page) => page.images)
      .map((i) => ({
        name: i.name,
        id: i.key,
        url: i.url,
      }))
  }, [data])

  function isSelected(image: ImageSchema) {
    return selectedImages?.some(({ id }) => id === image.id)
  }

  function onSelectMedia() {
    const filteredValue = value?.filter(({ id }) =>
      selectedImages?.some((selected) => selected.id === id),
    )

    const selectedWithOrder = selectedImages
      .filter(({ id }) => !filteredValue.some((v) => v.id === id))
      .map((file, index) => ({
        ...file,
        order: filteredValue.length + index,
      }))

    const newValue = [...filteredValue, ...selectedWithOrder]

    onChange(newValue)
    onOpenChange(false)
  }

  function onClickMedia(image: ImageSchema) {
    if (isSelected(image)) {
      setSelectedImages(selectedImages.filter(({ id }) => id !== image.id))
    } else {
      setSelectedImages([...selectedImages, image])
    }
  }

  const onSort = useCallback(
    (newImages: ProductImageSchema[]) => {
      const updatedImages = newImages.map((img, index) => ({
        ...img,
        order: index + 1,
      }))

      onChange(updatedImages)
    },
    [onChange],
  )

  const onRemove = useCallback(
    (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      const filteredImages = value.filter((_, i) => i !== index)
      const updatedImages = filteredImages.map((image, idx) => ({
        ...image,
        order: idx,
      }))
      onChange(updatedImages)
    },
    [onChange, value],
  )

  const onUploadSuccess = useCallback(
    async (uploadedFiles: ImageSchema[]) => {
      setOpen(false)
      const uploadedWithOrder = uploadedFiles.map((file, index) => ({
        ...file,
        order: value.length + index,
      }))

      onChange([...value, ...uploadedWithOrder])
      await refetch()
    },
    [onChange, refetch, value],
  )

  const sortedImages = useMemo(() => {
    if (!value || !value.length) return []
    return value.sort((a, b) => a.order - b.order)
  }, [value])

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && isIntersecting) {
      fetchNextPage()
    }
  }, [isIntersecting, isFetchingNextPage, hasNextPage, fetchNextPage])

  useEffect(() => {
    const selected = value?.filter(({ id }) =>
      libraryImages.some((img) => id === img.id),
    )

    setSelectedImages((prev) => {
      const prevIds = prev.map((image) => image.id)
      const newImages = selected.filter((image) => !prevIds.includes(image.id))
      return [...prev, ...newImages]
    })
  }, [libraryImages, value, open])

  function onOpenChange(open: boolean) {
    setOpen(open)
    if (!open) setSelectedImages([])
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex w-full flex-col overflow-y-auto"
          >
            <DialogHeader className="pb-6">
              <TabsList className="grid w-full max-w-[300px] grid-cols-2">
                <TabsTrigger value="library">Media Library</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
            </DialogHeader>

            <DialogBody>
              <TabsContent value="library">
                {!libraryImages.length && !isFetching ? (
                  <div className="flex w-full flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                    <p>No image found. Upload new images</p>
                    <Button
                      type="button"
                      variant={"outline"}
                      onClick={() => setActiveTab("upload")}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <DialogTitle>Media Library</DialogTitle>
                      <DialogDescription>
                        Click to select images for your product
                      </DialogDescription>
                    </div>

                    <div className="grid max-h-screen grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                      {libraryImages.map((image) => {
                        const selected = isSelected(image)

                        return (
                          <div
                            key={image.id}
                            className="group relative aspect-square cursor-pointer"
                            onClick={() => onClickMedia(image)}
                          >
                            <Image
                              fill
                              draggable={false}
                              src={image.url}
                              alt={image.name}
                              className="rounded-md border bg-muted/30 object-cover"
                            />
                            <div
                              className={cn(
                                "absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-md text-white transition-colors",
                                selected
                                  ? "bg-black/60"
                                  : "bg-transparent group-hover:bg-black/60",
                              )}
                            >
                              {selected && <Check className="h-6 w-6" />}
                            </div>
                          </div>
                        )
                      })}

                      {(isFetchingNextPage || isFetching) &&
                        Array.from({ length: 10 }).map((_, index) => (
                          <Skeleton key={index} className="aspect-square" />
                        ))}

                      {hasNextPage && !isFetchingNextPage && (
                        <div ref={ref} className="h-full" />
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="upload">
                <div className="mb-4">
                  <DialogTitle>Upload Files</DialogTitle>
                  <DialogDescription>
                    Drag and drop your files here or click to browse
                  </DialogDescription>
                </div>
                <FileUploader
                  folder="products"
                  multiple
                  maxFiles={10}
                  onSuccess={onUploadSuccess}
                />
              </TabsContent>
            </DialogBody>
          </Tabs>

          {activeTab === "library" && selectedImages?.length > 0 && (
            <DialogFooter className="mx-auto flex w-full max-w-[400px] items-center justify-center px-3">
              <Button
                type="button"
                variant={"outline"}
                onClick={onSelectMedia}
                className="w-full rounded-full bg-background hover:bg-background"
              >
                Select {selectedImages.length}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Sortable
        orientation="mixed"
        collisionDetection={closestCorners}
        value={value}
        onValueChange={onSort}
        overlay={
          <div className="size-full rounded-md bg-black/10 dark:bg-black/40" />
        }
      >
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          {sortedImages.length > 0 &&
            sortedImages?.map((image, index) => (
              <SortableItem
                asTrigger
                key={image.id}
                value={image.id}
                aria-disabled={disabled}
                className="group relative aspect-square rounded-md bg-muted aria-disabled:pointer-events-none"
              >
                <Image
                  fill
                  src={image.url}
                  alt={image.name}
                  className="rounded-md object-cover"
                />

                <Button
                  size="icon"
                  disabled={disabled}
                  variant={"destructive"}
                  onClick={(e) => onRemove(index, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  aria-label="Remove image"
                  className="absolute right-2 top-2 z-50 h-6 w-6 cursor-default opacity-0 transition-opacity disabled:opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </SortableItem>
            ))}

          {(!value || value?.length) < 10 && (
            <div
              aria-disabled={disabled}
              onClick={() => setOpen(true)}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-4 text-muted-foreground transition hover:bg-muted/30 aria-disabled:pointer-events-none aria-disabled:opacity-50"
            >
              <div className="rounded-full border border-dashed p-2 text-center">
                <Upload className="h-6 w-6" />
              </div>
              <p>Upload Images</p>
              <p className="text-xs text-muted-foreground/70">
                Max 10 files (4MB each)
              </p>
            </div>
          )}
        </div>
      </Sortable>
    </>
  )
}
