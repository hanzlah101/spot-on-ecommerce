"use client"

// Source: https://github.com/redpangilinan/credenza

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { cn } from "@/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface BaseProps {
  children: React.ReactNode
}

interface RootModalProps extends BaseProps {
  open?: boolean
  onOpenChange?: (_open: boolean) => void
}

interface ModalProps extends BaseProps {
  className?: string
  asChild?: true
}

const desktop = "(min-width: 768px)"

const Modal = (props: RootModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const Modal = isDesktop ? Dialog : Drawer

  return <Modal {...props} />
}

const ModalTrigger = (props: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalTrigger = isDesktop ? DialogTrigger : DrawerTrigger

  return <ModalTrigger {...props} />
}

const ModalClose = (props: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalClose = isDesktop ? DialogClose : DrawerClose

  return <ModalClose {...props} />
}

const ModalContent = (props: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalContent = isDesktop ? DialogContent : DrawerContent

  return <ModalContent {...props} />
}

const ModalBody = (props: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalBody = isDesktop ? DialogBody : DrawerBody

  return <ModalBody {...props} />
}

const ModalDescription = (props: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalDescription = isDesktop ? DialogDescription : DrawerDescription

  return <ModalDescription {...props} />
}

const ModalHeader = (props: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalHeader = isDesktop ? DialogHeader : DrawerHeader

  return <ModalHeader {...props} />
}

const ModalTitle = (props: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalTitle = isDesktop ? DialogTitle : DrawerTitle

  return <ModalTitle {...props} />
}

const ModalFooter = ({ className, ...props }: ModalProps) => {
  const isDesktop = useMediaQuery(desktop)
  const ModalFooter = isDesktop ? DialogFooter : DrawerFooter

  return (
    <ModalFooter
      className={cn(
        "w-full flex-col-reverse bg-muted/60 dark:bg-muted/40 md:-mt-4 md:flex-row md:pt-4",
        className,
      )}
      {...props}
    />
  )
}

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalBody,
}
