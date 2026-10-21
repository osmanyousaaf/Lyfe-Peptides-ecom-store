import Header from "./Header";
import Footer from "./Footer";
import Providers from "./Providers";
import { SiteProvider } from "@/lib/site-context";
import { getSettings } from "@/lib/settings";
import { getCategories, productsByCategory } from "@/lib/products";

// The shop's frame: header, footer, cart, chat and age gate around a storefront page.
export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const categories = getCategories().map((name) => ({ name, count: productsByCategory(name).length }));
  return (
    <SiteProvider value={settings}>
      <Providers>
        <Header categories={categories} announcements={settings.announcements} />
        <main>{children}</main>
        <Footer />
      </Providers>
    </SiteProvider>
  );
}
