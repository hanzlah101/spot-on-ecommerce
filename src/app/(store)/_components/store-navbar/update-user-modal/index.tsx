"use client"

import type { User } from "lucia"
import { useIsMutating } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { useUpdateUserModal } from "@/stores/use-update-user-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"

import { UpdateProfileForm } from "./update-profile-form"
import { UpdatePasswordForm } from "./update-password-form"

type UserModalProps = {
  user: User
}

export function UpdateUserModal({ user }: UserModalProps) {
  const { isOpen, onOpenChange, activeTab, setActiveTab } = useUpdateUserModal()

  const isUpdatingProfile = useIsMutating({
    mutationKey: ["update-user-profile"],
  })

  const isUpdatingPassword = useIsMutating({
    mutationKey: ["update-user-password"],
  })

  const isPending = isUpdatingProfile > 0 || isUpdatingPassword > 0

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex w-full flex-col overflow-y-auto"
        >
          <ModalHeader className="pb-6">
            <TabsList className="grid w-full max-w-[300px] grid-cols-2">
              <TabsTrigger value="profile">Update profile</TabsTrigger>
              <TabsTrigger value="password">Update password</TabsTrigger>
            </TabsList>
          </ModalHeader>

          <ModalBody>
            <TabsContent value="profile">
              <div>
                <ModalTitle>Update profile info</ModalTitle>
                <ModalDescription className="mt-1">
                  Make changes to your personal details
                </ModalDescription>
              </div>
              <UpdateProfileForm
                name={user.name}
                image={user?.image ?? undefined}
              />
            </TabsContent>

            <TabsContent value="password">
              <div>
                <ModalTitle>Update password</ModalTitle>
                <ModalDescription className="mt-1">
                  You&apos;ll be logged out of other devices
                </ModalDescription>
              </div>
              <UpdatePasswordForm />
            </TabsContent>
          </ModalBody>
        </Tabs>

        <ModalFooter>
          <ModalClose asChild>
            <Button disabled={isPending} variant={"outline"} type="button">
              Close
            </Button>
          </ModalClose>
          <Button
            type="submit"
            form={`update-user-${activeTab}-form`}
            loading={isPending}
          >
            Update {activeTab}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
