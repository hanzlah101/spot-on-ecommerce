import { create } from "zustand"
import { persist } from "zustand/middleware"

import { CartItem } from "@/utils/types"

type CartStore = {
  cart: CartItem[]
  addToCart: (_product: CartItem) => void
  changeProductQty: (_product: CartItem) => void
  removeFromCart: (_product: CartItem) => void
  toggleSelectItem: (_product: CartItem) => void
  removeAllProducts: () => void
  toggleAllSelect: () => void
}

export const useCartStore = create(
  persist<CartStore>(
    (set) => ({
      cart: [],

      addToCart: (product: CartItem) => {
        set((state) => {
          const existingProduct = state.cart.find(
            (item) =>
              item.productId === product.productId &&
              item.combinationId === product.combinationId,
          )

          let updatedCart
          if (existingProduct) {
            updatedCart = state.cart.map((item) =>
              item.productId === product.productId &&
              item.combinationId === product.combinationId
                ? { ...item, quantity: item.quantity + product.quantity }
                : item,
            )
          } else {
            updatedCart = [...state.cart, product]
          }

          return { cart: updatedCart }
        })
      },

      changeProductQty: (product: CartItem) => {
        set((state) => {
          const updatedCart = state.cart.map((item) =>
            item.productId === product.productId &&
            item.combinationId === product.combinationId
              ? { ...item, quantity: product.quantity }
              : item,
          )

          return { cart: updatedCart }
        })
      },

      removeFromCart: (product: CartItem) => {
        set((state) => {
          const updatedCart = state.cart.filter(
            (item) =>
              !(
                item.productId === product.productId &&
                item.combinationId === product.combinationId
              ),
          )

          return { cart: updatedCart }
        })
      },

      toggleSelectItem: (product) => {
        set((state) => {
          const updatedCart = state.cart.map((item) =>
            item.productId === product.productId &&
            item.combinationId === product.combinationId
              ? { ...item, isSelected: !item.isSelected }
              : item,
          )

          return { cart: updatedCart }
        })
      },
      toggleAllSelect: () => {
        set((store) => ({
          cart: store.cart.map((item) => ({
            ...item,
            isSelected: !store.cart.every((item) => !!item.isSelected),
          })),
        }))
      },
      removeAllProducts: () => {
        set((store) => ({
          cart: store.cart
            .filter((item) => !item.isSelected)
            .map((item) => ({ ...item, isSelected: !item.isSelected })),
        }))
      },
    }),

    {
      name: "cart-storage",
    },
  ),
)
