import { currentCustomerId } from "@/lib/customer-session";
import { getAccount, signupCoupon } from "@/lib/customers";

// The signed-in customer for client components: name, avatar and their personal code. Never cached.
export async function GET() {
  const id = await currentCustomerId();
  const a = id ? getAccount(id) : undefined;
  if (!a) return Response.json({ signedIn: false }, { headers: { "Cache-Control": "no-store" } });
  const c = signupCoupon(a);
  return Response.json(
    {
      signedIn: true,
      name: a.name,
      firstName: a.name.split(" ")[0] || a.email.split("@")[0],
      email: a.email,
      picture: a.picture,
      code: c ? { code: c.code, label: `${c.value}% off`, usable: c.state === "active" } : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
