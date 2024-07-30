import { useQueryClient } from "@tanstack/react-query"

export function useInvalidateQueries() {
  const queryClient = useQueryClient()

  async function invalidate(keys: string[]) {
    for (const key of keys) {
      await queryClient.invalidateQueries({
        queryKey: [key],
      })
    }
  }

  return { invalidate }
}
