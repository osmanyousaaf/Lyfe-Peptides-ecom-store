import { dashboard } from "@/lib/dashboard";
import { BarList, Kpi, SERIES, TrendChart } from "@/components/admin/charts";
import { Card, PageHeader, rangeOf } from "@/components/admin/ui";

export default async function AudiencePage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const days = rangeOf((await searchParams).range);
  const d = await dashboard(days);
  const k = d.kpis;

  return (
    <>
      <PageHeader title="Audience" sub={`Who visited, from where, over the last ${days} days`} sample={d.sample} />
      <div className="space-y-6 px-5 pb-12 pt-4 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Unique visitors" value={k.visitors.value} f="int" change={k.visitors.change} series={k.visitors.series} />
          <Kpi label="Page views" value={k.pageviews.value} f="int" hint={`${k.visitors.value ? (k.pageviews.value / k.visitors.value).toFixed(1) : "0"} pages per visitor`} />
          <Kpi label="On the site now" value={k.live} f="int" hint="Active in the last 5 minutes" />
          <Kpi label="Visitor to order" value={k.conversion.value} f="pct" change={k.conversion.change} />
        </div>

        <TrendChart title="Daily visitors" data={d.visitorSeries} f="int" color={SERIES.navy} total={d.kpis.visitors.value} totalLabel="unique visitors in this period" />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Visitors by province" sub="Canadian visitors, from the hosting edge's location data">
            <BarList items={d.visitorProvinces} f="int" limit={10} empty="No visits yet" />
          </Card>
          <Card title="Visitors by country">
            <BarList items={d.countries} f="int" limit={8} empty="No visits yet" />
          </Card>
          <Card title="Traffic sources" sub="First page of each visit">
            <BarList items={d.sources} f="int" empty="No visits yet" />
          </Card>
          <Card title="Devices">
            <BarList items={d.devices} f="int" empty="No visits yet" />
          </Card>
        </div>

        <Card title="Top pages" sub="Page views">
          <BarList items={d.pages} f="int" limit={10} color={SERIES.orange} empty="No page views yet" />
        </Card>
        <p className="text-xs text-[#8d99ab]">
          Location comes from your host&rsquo;s geo headers (Vercel or Cloudflare). On localhost it shows as &ldquo;Unknown&rdquo;.
        </p>
      </div>
    </>
  );
}
