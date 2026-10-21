import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import CouponForm from "@/components/admin/sales/CouponForm";
import { getCoupon } from "@/lib/coupons";
import { saveCoupon } from "../actions";

export const metadata: Metadata = { title: "Edit coupon" };

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const c = getCoupon(Number((await params).id));
  if (!c) notFound();
  return (
    <>
      <PageHeader back={{ href: "/admin/coupons", label: "Coupons" }} title={c.code} description={`Used ${c.uses} time${c.uses === 1 ? "" : "s"}`} />
      <CouponForm coupon={c} action={saveCoupon} />
    </>
  );
}
