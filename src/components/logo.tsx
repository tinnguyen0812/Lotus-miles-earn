import { Plane } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg";

// thêm xs (nhỏ hơn để dùng ở header)
const WRAP = { xs: 32, sm: 72, md: 96, lg: 120 };
const ICON_PAD = { xs: 6, sm: 16, md: 18, lg: 20 };
const TEXT = { xs: "text-base", sm: "text-base", md: "text-xl", lg: "text-2xl" };

export function Logo({
  size = "lg",
  withText = true,
}: {
  size?: Size;
  withText?: boolean; // cho phép ẩn chữ trong header
}) {
  const wrap = WRAP[size];
  const icon = wrap - ICON_PAD[size] * 2;

  return (
    <div className="flex flex-col items-center gap-2 pointer-events-none select-none shrink-0">
      <div
        className="
          relative overflow-hidden rounded-full ring-1 ring-teal-200
          shadow-[0_10px_28px_rgba(13,148,136,.15)]
          bg-gradient-to-b from-white to-teal-50 grid place-items-center
        "
        style={{ width: wrap, height: wrap }}
      >
        <Plane className="relative" size={icon} color="#0f766e" />
      </div>

      {withText && (
        <div className={`${TEXT[size]} font-semibold text-teal-600 leading-none`}>
          LotusMiles
        </div>
      )}
    </div>
  );
}
