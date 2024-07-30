"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { Edit, Timer, TimerOff, X } from "lucide-react"
import { useIsMutating } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import type { Order } from "@/db/schema"
import { useModifiedUrl } from "@/hooks/use-modified-url"
import { cancelOrder, holdOrder, unHoldOrder } from "@/actions/order"
import { Button } from "@/components/ui/button"
import { OrderInfoForm } from "./confirm-order/order-info-form"
import { useConfirmModal } from "@/stores/use-confirm-modal"
import { useUpdateOrderInfoModal } from "@/stores/use-update-order-info-modal"
import { triggerConfetti } from "@/utils/confetti"
import { useCartStore } from "@/stores/use-cart-store"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type OrderActionButtonsProps = {
  order: Order
}

export function OrderActionButtons({ order }: OrderActionButtonsProps) {
  const { isOpen, onOpenChange } = useUpdateOrderInfoModal()
  const { onOpen } = useConfirmModal()
  const { removeAllProducts } = useCartStore()

  const { trackingId }: { trackingId: string } = useParams()

  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const mode = searchParams.get("mode")

  const { modifyUrl } = useModifiedUrl()
  const router = useRouter()

  const mutations = useIsMutating({ mutationKey: ["update-order-info"] })
  const isPending = mutations > 0

  const canEdit = order.status === "processing"
  const canHold =
    canEdit && order.status !== "cancelled" && order.status !== "delivered"

  const canUnHold = order.status === "on hold"

  useEffect(() => {
    if (mode === "cart") {
      removeAllProducts()
    }

    if (success === "1") {
      triggerConfetti()
      toast.success("Order placed successfully", { id: "order-success" })
      const url = modifyUrl({ ["success"]: null, ["mode"]: null })
      router.push(url, { scroll: false })
    }
  }, [success, router, modifyUrl, mode, removeAllProducts])

  if (order.status === "cancelled" || order.status === "delivered") {
    return null
  }

  return (
    <div className="flex items-center justify-end gap-x-5">
      <Modal open={isOpen} onOpenChange={onOpenChange}>
        <Tooltip delayDuration={250}>
          <TooltipTrigger
            disabled={!canEdit}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-50"
          >
            <ModalTrigger asChild>
              <Edit className="size-4" />
            </ModalTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {canEdit ? (
              "Edit order info"
            ) : (
              <>
                Order already dispatched.
                <br />
                Contact sellar
              </>
            )}
          </TooltipContent>
        </Tooltip>
        <ModalContent className="md:max-w-2xl">
          <ModalHeader>
            <ModalTitle>Update order info</ModalTitle>
            <ModalDescription>
              Please be precise with your information
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <OrderInfoForm
              user={null}
              items={[]}
              total={
                order.subtotal +
                order.shippingFee +
                order.taxes -
                (order.discount ?? 0)
              }
              initialData={{
                city: order.city,
                state: order.state,
                streetAddress: order.streetAddress,
                email: order.email,
                phoneNumber: order.phoneNumber,
                customerName: order.customerName,
                paymentMethod: order.paymentMethod,
              }}
            />
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button disabled={isPending} variant={"outline"} type="button">
                Close
              </Button>
            </ModalClose>
            <Button type="submit" form="order-info-form" loading={isPending}>
              Update Info
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {canHold ? (
        <Tooltip delayDuration={250}>
          <TooltipTrigger
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={() =>
              onOpen({
                onConfirm: () => holdOrder({ trackingId }),
                description: "Your order will be on hold.",
              })
            }
          >
            <Timer className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Hold order</TooltipContent>
        </Tooltip>
      ) : canUnHold ? (
        <Tooltip delayDuration={250}>
          <TooltipTrigger
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={() =>
              onOpen({
                onConfirm: () => unHoldOrder({ trackingId }),
                description: "Your order will be reprocessed.",
              })
            }
          >
            <TimerOff className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Unhold order</TooltipContent>
        </Tooltip>
      ) : null}

      <Tooltip delayDuration={250}>
        <TooltipTrigger
          disabled={!canEdit}
          className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-50"
          onClick={() =>
            onOpen({
              onConfirm: () => cancelOrder({ trackingId }),
              description: "Your order will be cancelled.",
            })
          }
        >
          <X className="size-4" />
        </TooltipTrigger>
        <TooltipContent>
          {canEdit ? (
            "Cancel order"
          ) : (
            <>
              Order already dispatched.
              <br />
              Contact sellar
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
