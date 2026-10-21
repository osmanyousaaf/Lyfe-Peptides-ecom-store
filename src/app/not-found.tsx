import Link from "next/link";
import StoreChrome from "@/components/StoreChrome";

export default function NotFound() {
  return (
    <StoreChrome>
      <section className="wrap section">
        <h1 className="display mb-6 max-w-[12ch] text-navy">Not in the catalog</h1>
        <p className="mb-10 max-w-[40ch] text-muted">
          The link may be old, or the product may have moved.
        </p>
        <Link href="/shop" className="btn btn-solid">Back to the catalog</Link>
      </section>
    </StoreChrome>
  );
}
