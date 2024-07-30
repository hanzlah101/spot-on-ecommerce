"use client"

import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useConfirmModal } from "@/stores/use-confirm-modal"
import { Spinner } from "@/components/ui/spinner"
import { parseError } from "@/utils/error"

export function ConfirmModal() {
  const { data, isOpen, onOpenChange, onClose } = useConfirmModal()
  const { title, description, onConfirm, onSuccess } = data

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await onConfirm()

      if (res?.serverError || res?.validationErrors) {
        const err = parseError(res)
        throw err
      }
    },
    onSuccess,
    onError(error) {
      if (typeof error === "string") {
        toast.error(error)
      } else {
        toast.error(DEFAULT_SERVER_ERROR_MESSAGE)
      }
    },
    onSettled() {
      onClose()
    },
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description} This action can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => mutate()}
            className="w-[90px]"
          >
            {isPending ? <Spinner /> : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
