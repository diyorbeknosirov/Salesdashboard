import { COLORS } from "@/lib/constants";

const DEFAULT_LOGO = "/deepai-logo.jpg";

export default function Avatar({ initials, src, size = 40, ring }) {
  const imageSrc = src || DEFAULT_LOGO;
  return (
    <img
      src={imageSrc}
      alt={initials || "avatar"}
      className="rounded-full object-cover shrink-0"
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 3px ${ring}` : "none",
        background: COLORS.primary,
      }}
    />
  );
}
