"use client";

import { useState } from "react";

const MG = [2, 5, 10, 20, 50];
const WATER = [1, 2, 3];

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function Reconstitution() {
  const [mg, setMg] = useState(10);
  const [water, setWater] = useState(2);
  const [amount, setAmount] = useState(250);

  const perMl = (mg * 1000) / water; // mcg per mL
  const volume = amount / perMl; // mL
  const units = volume * 100; // on a U-100 1 mL syringe
  const over = units > 100;
  const fill = Math.min(1, units / 100);

  return (
    <section className="section wrap" id="reconstitution">
      <div className="grid grid-cols-12 gap-x-6 gap-y-14">
        <div className="col-span-12 lg:col-span-5">
          <h2 className="head mb-5 max-w-[20ch]" data-reveal>
            Do the reconstitution math
          </h2>
          <p className="mb-10 max-w-[40ch]" data-reveal style={{ ["--d" as string]: "80ms" }}>
            Set what is in the vial, how much bacteriostatic water you add and
            the amount you need per draw. The syringe shows exactly where to stop.
          </p>

          <fieldset className="mb-8" data-reveal style={{ ["--d" as string]: "140ms" }}>
            <legend className="mb-3 text-small font-medium">Peptide in the vial</legend>
            <div className="flex flex-wrap gap-2">
              {MG.map((v) => (
                <Choice key={v} on={mg === v} onClick={() => setMg(v)}>
                  {v} mg
                </Choice>
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-8" data-reveal style={{ ["--d" as string]: "200ms" }}>
            <legend className="mb-3 text-small font-medium">Bacteriostatic water added</legend>
            <div className="flex flex-wrap gap-2">
              {WATER.map((v) => (
                <Choice key={v} on={water === v} onClick={() => setWater(v)}>
                  {v} mL
                </Choice>
              ))}
            </div>
          </fieldset>

          <div data-reveal style={{ ["--d" as string]: "260ms" }}>
            <label htmlFor="amount" className="mb-3 flex items-baseline justify-between text-small font-medium">
              <span>Amount per draw</span>
              <span className="num">{fmt(amount)} mcg</span>
            </label>
            <input
              id="amount"
              type="range"
              min={50}
              max={2000}
              step={50}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>

        <div className="col-span-12 flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          {/* the syringe, drawn to scale: 100 units across the barrel */}
          <svg viewBox="0 0 640 120" className="mb-10 w-full" role="img" aria-label={`Syringe filled to ${fmt(Math.min(units, 100), 1)} of 100 units`}>
            {/* finger flange at the open end */}
            <rect x="50" y="24" width="10" height="72" fill="var(--muted)" />
            {/* barrel */}
            <rect x="60" y="38" width="500" height="44" fill="var(--surface)" />
            {/* liquid, held against the needle end */}
            <rect
              x="60"
              y="38"
              width="500"
              height="44"
              fill={over ? "var(--muted)" : "var(--accent)"}
              style={{
                transformBox: "fill-box",
                transformOrigin: "right",
                transform: `scaleX(${fill})`,
                transition: "transform 320ms cubic-bezier(.2,.7,.2,1)",
              }}
            />
            {/* stopper at the edge of the liquid */}
            <g style={{ transform: `translateX(${-500 * fill}px)`, transition: "transform 320ms cubic-bezier(.2,.7,.2,1)" }}>
              <rect x="550" y="38" width="10" height="44" fill="var(--ink)" />
            </g>
            {/* graduations: 0 at the needle, 100 at the open end */}
            {Array.from({ length: 11 }).map((_, i) => (
              <g key={i}>
                <rect x={560 - i * 50 - 1} y={i % 5 === 0 ? 28 : 32} width="2" height={i % 5 === 0 ? 10 : 6} fill="var(--muted)" />
                {i % 5 === 0 && (
                  <text x={560 - i * 50} y="20" textAnchor="middle" fill="var(--muted)" fontSize="13" fontFamily="inherit">
                    {i * 10}
                  </text>
                )}
              </g>
            ))}
            {/* hub and needle */}
            <rect x="560" y="52" width="20" height="16" fill="var(--surface-2)" />
            <rect x="580" y="59" width="56" height="2" fill="var(--muted)" />
          </svg>

          {/* figures first, the words that explain them beneath */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            <p className="flex flex-col gap-2">
              <span className="num head">{over ? "100+" : fmt(units, units < 10 ? 1 : 0)} units</span>
              <span className="text-small text-muted">to draw on the syringe</span>
            </p>
            <p className="flex flex-col gap-2">
              <span className="num head">{fmt(volume, 2)} mL</span>
              <span className="text-small text-muted">of reconstituted solution</span>
            </p>
            <p className="num col-span-2">
              {fmt(perMl)} mcg per mL, which is {fmt(perMl / 10)} mcg in every 10 units.
            </p>
          </div>

          <p className="mt-8 max-w-[52ch] text-small text-muted" aria-live="polite">
            {over
              ? "That amount needs more than one full 1 mL syringe. Add less water, or split it into two draws."
              : "Read on a 1 mL U-100 insulin syringe. Concentration = mg × 1000 ÷ mL of water. For laboratory research only."}
          </p>
        </div>
      </div>
    </section>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`num min-h-[44px] min-w-[64px] px-4 text-small transition-colors duration-150 active:translate-y-px ${
        on ? "rounded-lg border border-navy bg-navy text-white" : "rounded-lg border border-line bg-white text-ink hover:border-navy"
      }`}
    >
      {children}
    </button>
  );
}
