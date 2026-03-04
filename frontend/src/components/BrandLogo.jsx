import { GraduationCap } from "lucide-react";

const BrandLogo = ({
  size = "md",
  titleClassName = "text-white font-semibold text-lg",
  subtitleClassName = "text-xs text-white/70",
}) => {
  const badgeSizeClass = size === "sm" ? "w-10 h-10 rounded-xl" : "w-12 h-12 rounded-2xl";
  const iconSizeClass = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const titleSizeClass = size === "sm" ? "text-sm" : "text-lg";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative ${badgeSizeClass} bg-gradient-to-br from-[#2563eb] via-[#4f46e5] to-[#7c3aed] flex items-center justify-center shadow-lg shrink-0`}
      >
        <div
          className={`absolute inset-0 ${size === "sm" ? "rounded-xl" : "rounded-2xl"} bg-gradient-to-br from-[#2563eb] to-[#7c3aed] blur-xl opacity-40`}
        ></div>
        <GraduationCap className={`relative text-white ${iconSizeClass}`} />
      </div>

      <div>
        <h1 className={`${titleClassName} ${titleSizeClass}`}>Smart College</h1>
        <p className={subtitleClassName}>Companion</p>
      </div>
    </div>
  );
};

export default BrandLogo;
