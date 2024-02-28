import { format } from 'date-fns';

import prismadb from "@/lib/prismadb";

import { CouponsClient } from "./components/client";
import { CouponColumn } from "./components/columns";

const CouponsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const coupons = await prismadb.coupon.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedCoupons: CouponColumn[] = coupons.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, "MMMM do, yyyy")
  }))

  return (
    <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <CouponsClient data={formattedCoupons} />
        </div>
    </div>
  )
}

export default CouponsPage;