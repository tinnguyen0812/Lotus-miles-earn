import airplaneImage from 'figma:asset/6601fefd1b64624cdd3f4e87670ff0f46b8fac16.png';

export function Logo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl"
  };

  const imageSizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center relative shadow-lg border-2 border-teal-100`}>
        {/* Airplane image */}
        <img 
          src={airplaneImage}
          alt="LotusMiles Airplane"
          className={`${imageSizeClasses[size]} object-contain`}
        />
      </div>
      <div className={`${textSizeClasses[size]} font-medium text-teal-600`}>
        LotusMiles
      </div>
    </div>
  );
}