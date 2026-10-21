import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductEditor from "@/components/admin/catalog/ProductEditor";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, PageHeader, formatDate } from "@/components/admin/ui";
import { adminGetProduct, adminListProducts } from "@/lib/products";
import { deleteProductAction, duplicateProductAction, saveProductAction } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = adminGetProduct(Number((await params).id));
  return { title: p ? p.name : "Product" };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const product = Number.isInteger(id) ? adminGetProduct(id) : undefined;
  if (!product) notFound();
  const categories = [...new Set(adminListProducts().flatMap((p) => p.categories))].sort();

  return (
    <>
      <PageHeader
        title={product.name}
        back={{ href: "/admin/products", label: "Products" }}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone={product.status === "published" ? "green" : "gray"}>{product.status === "published" ? "Live" : "Draft"}</Badge>
            <span>Last edited {formatDate(product.updatedAt, true)}</span>
          </span>
        }
        actions={
          <>
            <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className="btn btn-line btn-sm rounded-xl">
              View in store
            </a>
            <form action={duplicateProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <button className="btn btn-line btn-sm rounded-xl">Duplicate</button>
            </form>
            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <input type="hidden" name="from" value="editor" />
              <ConfirmButton confirm={`Delete "${product.name}"? This can't be undone.`} className="btn btn-line btn-sm rounded-xl text-red-600 hover:border-red-600">
                Delete
              </ConfirmButton>
            </form>
          </>
        }
      />
      <ProductEditor product={product} action={saveProductAction} categorySuggestions={categories} />
    </>
  );
}
