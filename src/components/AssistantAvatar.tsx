// "Lyra", the Lyfe assistant: a glossy 3D orb in the brand's orange and navy, with a soft
// specular highlight, a glow ring and two little eyes that blink. Pure CSS, scales to any size.
export default function AssistantAvatar({ size = 44, live = true }: { size?: number; live?: boolean }) {
  return (
    <span className="lyra relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} aria-hidden>
      {/* glow ring */}
      {live && <span className="absolute -inset-[18%] rounded-full bg-[conic-gradient(from_0deg,#f26a12,#ffb37a,#13294b,#f26a12)] opacity-60 blur-[6px] [animation:lyra-spin_6s_linear_infinite]" />}
      {/* the sphere */}
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffd9bd_0%,#ff8a3d_28%,#f26a12_48%,#9c3d06_78%,#13294b_100%)] shadow-[inset_-6px_-8px_14px_rgba(19,41,75,0.55),inset_4px_5px_10px_rgba(255,255,255,0.35),0_8px_18px_-6px_rgba(242,106,18,0.7)]" />
      {/* specular highlight */}
      <span className="absolute left-[20%] top-[14%] h-[26%] w-[34%] -rotate-[25deg] rounded-full bg-white/75 blur-[1.5px]" />
      {/* face */}
      <span className="relative mt-[8%] flex gap-[18%]" style={{ width: "44%" }}>
        <span className="lyra-eye block aspect-[1/1.5] w-[28%] rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
        <span className="lyra-eye block aspect-[1/1.5] w-[28%] rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
      </span>
    </span>
  );
}
