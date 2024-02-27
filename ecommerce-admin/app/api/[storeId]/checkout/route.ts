import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function OPTIONS() {
    return NextResponse.json({});
}

interface Product {
    id: string;
    quantity: number;
}

export async function POST(
    req: Request,
    { params }: { params: { storeId:string } }
) {
    const { products }: { products: Product[] } = await req.json();

    if( !products || products.length === 0 ) {
        return new NextResponse("Product ids are required", { status: 400 });
    }

    console.log(products);
    console.log("Num: "+products.length);
    const ids = products.map((item: Product) => item.id);

    const product = await prismadb.product.findMany({
        where: {
            id: {
                in: ids
            }
        }
    });

    product.forEach((item) => {
        const quantity = products.find((p: Product) => p.id === item.id)?.quantity || 0;
        if ( item.quantity - quantity  < 0 ) {
            return new NextResponse(`The quantity of ${item.name} in stock is insufficient`, { status: 400 });
        }
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    product.forEach((item) => {
        line_items.push({
            quantity: products.find((p: Product) => p.id === item.id)?.quantity,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(parseFloat(item.price) * 100)
            }
        });
    });

    console.log(line_items);

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: products.map((item: Product) => ({
                    quantity: item.quantity,
                    product: {
                        connect: {
                            id: item.id
                        }
                    }
                }))
            }
        }
    });

    console.log(order);

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        billing_address_collection: "required",
        phone_number_collection: {
            enabled: true
        },
        success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
        metadata: {
            orderId: order.id
        }
    });

    return NextResponse.json({ url: session.url });
}