import type { AnimKey } from "@/lib/blog";
import AnimatedPen from "./AnimatedPen";
import AnimatedVial from "./AnimatedVial";
import Chromatogram from "./Chromatogram";
import CoaScan from "./CoaScan";
import StorageScene from "./StorageScene";

export default function PostAnim({ anim, className = "" }: { anim: AnimKey; className?: string }) {
  switch (anim) {
    case "vial":
      return <AnimatedVial className={className} />;
    case "pen":
      return <AnimatedPen className={className} />;
    case "hplc":
      return <Chromatogram className={className} />;
    case "coa":
      return <CoaScan className={className} />;
    case "storage":
      return <StorageScene className={className} />;
  }
}
