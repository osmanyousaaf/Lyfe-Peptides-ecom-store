"use client";

import Image from "next/image";
import { isUpload } from "@/lib/img";
import { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="exhibit relative aspect-[4/5]">
        <Image
          key={images[active]}
          src={images[active]}
          alt={name}
          fill
          priority
          unoptimized={isUpload(images[active])}
          sizes="(max-width: 768px) 100vw, 640px"
          className="rise object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show picture ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
              className="exhibit relative aspect-[4/5] w-20 transition-opacity duration-200"
              style={{ opacity: i === active ? 1 : 0.5 }}
            >
              <Image src={src} alt="" fill sizes="80px" unoptimized={isUpload(src)} className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
