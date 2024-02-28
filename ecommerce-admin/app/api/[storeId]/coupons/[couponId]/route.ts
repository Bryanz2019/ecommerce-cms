import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, couponId: string } }
 ) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, value } = body;

        if (!userId) {
            return new NextResponse('Unauthenticated', { status: 401 });
        }

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        if (!value) {
            return new NextResponse('Value is required', { status: 400 });
        }

        if (!params.couponId) {
            return new NextResponse('Coupon id is required', { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse('Unauthorized', { status: 403 });
        }

        const coupon = await prismadb.coupon.updateMany({
            where: {
                id: params.couponId,
            },
            data: {
                name,
                value
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.log('[COUPON_PATCH]', error);
        return new NextResponse('Internal error', { status: 500 })
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, couponId: string } }
 ) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse('Unauthenticated', { status: 401 });
        }

        if (!params.couponId) {
            return new NextResponse('Coupon id is required', { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse('Unauthorized', { status: 403 });
        }

        const coupon = await prismadb.coupon.deleteMany({
            where: {
                id: params.couponId,
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.log('[COUPON_DELETE]', error);
        return new NextResponse('Internal error', { status: 500 })
    }
};

export async function GET (
    req: Request,
    { params }: { params: { couponId: string } }
 ) {
    try {
        if (!params.couponId) {
            return new NextResponse('Coupon id is required', { status: 400 });
        }

        const coupon = await prismadb.coupon.findUnique({
            where: {
                id: params.couponId,
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.log('[COUPON_GET]', error);
        return new NextResponse('Internal error', { status: 500 })
    }
};