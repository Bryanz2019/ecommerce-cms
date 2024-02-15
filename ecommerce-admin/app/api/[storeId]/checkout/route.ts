import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
    req: Request,
    { params }: { params: { storeId:string } }
) {
    const { products } = await req.json();

    if( !products || products.length === 0 ) {
        return new NextResponse("Product ids are required", { status: 400 });
    }

    const product = await prismadb.product.findMany({
        where: {
            id: {
                in: products.map((item: {id: string, quantity: number}) => item.id)
            }
        }
    });

    product.forEach((item) => {
        const quantity = products.find((p: {id: string, quantity: number}) => p.id === item.id).quantity;
        if ( item.quantity - quantity  < 0 ) {
            return new NextResponse(`The quantity of ${item.name} in stock is insufficient`, { status: 400 });
        }
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    product.forEach((item) => {
        line_items.push({
            quantity: products.find((p: {id: string, quantity: number}) => p.id === item.id).quantity,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: item.name,
                },
                unit_amount: parseFloat(item.price) * 100
            }
        });
    });

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: products.map((item: {id: string, quantity: number}) => ({
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

    return NextResponse.json({ url: session.url }, {
        headers: corsHeaders
    });
}