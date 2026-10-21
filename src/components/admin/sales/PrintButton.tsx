"use client";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn btn-navy btn-sm">
      {label}
    </button>
  );
}
