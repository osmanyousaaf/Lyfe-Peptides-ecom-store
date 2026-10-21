import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import CouponForm from "@/components/admin/sales/CouponForm";
import { saveCoupon } from "../actions";

export const metadata: Metadata = { title: "New coupon" };

export default function NewCouponPage() {
  return (
    <>
      <PageHeader back={{ href: "/admin/coupons", label: "Coupons" }} title="New coupon" />
      <CouponForm action={saveCoupon} />
    </>
  );
}
