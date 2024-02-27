"use client";

import { FormEventHandler } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

import { Product } from "@/types";
import Currency from "@/components/ui/currency";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";

interface InfoProps {
    data: Product;
}

const Info: React.FC<InfoProps> = ({
    data
}) => {
    const cart = useCart();

    const onAddToCart: FormEventHandler<HTMLFormElement> = (event) => {
        event.stopPropagation();
        const value = event.currentTarget.elements.namedItem("quantity") as HTMLInputElement;
        cart.addItem({...data, quantity: parseInt(value.value)});
    }

    return (
        <div>
            <form onSubmit={onAddToCart}>
                <h1 className="text-3xl font-bold text-gray-900">
                    {data.name}
                </h1>
                <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl text-gray-900">
                        <Currency value={data?.price} />
                    </p>
                </div>
                <hr className="my-4" />
                <div className="flex flex-col gap-y-6">
                    <div className="flex items-center gap-x-4">
                        <h3 className="font-semibold text-black">Size:</h3>
                        <div>
                            {data?.size?.name}
                        </div>
                    </div>
                    <div className="flex items-center gap-x-4">
                        <h3 className="font-semibold text-black">Color:</h3>
                        <div className="h-6 w-6 rounded-full border border-gray-600"
                            style={{ backgroundColor: data?.color?.value }}
                        />
                    </div>
                    <div className="flex items-center gap-x-4">
                        <h3 className="font-semibold text-black">Quantity:</h3>
                        <input required name="quantity" type="number" min="1" placeholder="Amount" />
                    </div>
                </div>
                <div className="mt-10 flex items-center gap-x-3">
                    <Button type="submit" className="flex items-center gap-x-2">
                        Add To Cart
                        <ShoppingCart />
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default Info