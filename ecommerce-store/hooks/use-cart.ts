import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "react-hot-toast";

import { Product } from "@/types";

interface CartStore {
    items: Product[],
    addItem: (data: Product) => void,
    removeItem: (id: string) => void,
    removeAll: () => void
}

const useCart = create(
    persist<CartStore>((set, get) => ({
        items: [],
        addItem: (data: Product) => {
            if( data == null ) return;
            toast.success("id: "+data.id);
            const currentItems = get().items;
            const existingItem = currentItems.find((item) => item.id === data.id);

            if( existingItem ) {
                existingItem.quantity += 1;
                toast.success("Additional item added to cart.")
            } else {
                set({ items: [...get().items, data] });
                toast.success("Item added to cart.")
            }
        },
        removeItem: (id: string) => {
            set({ items: [...get().items.filter((item) => item.id !== id)] });
            toast.success("Item removed from the cart.");
        },
        removeAll: () => set({ items: [] })
    }), {
        name: "cart-storage",
        storage: createJSONStorage(() => localStorage)
    })
);

export default useCart;