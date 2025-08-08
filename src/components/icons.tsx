import type { SVGProps } from "react";

export function LotusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2c2.4-1.2 4.2-2 6-2 2.4 0 4.8 1.2 6 2.4-1.2 1.2-2.4 3.6-2.4 6 0 2.4 1.2 4.2 2.4 6-1.2 1.2-3.6 2.4-6 2.4-1.8 0-3.6-.6-5.4-1.8" />
      <path d="M12 2c-2.4-1.2-4.2-2-6-2-2.4 0-4.8 1.2-6 2.4 1.2 1.2 2.4 3.6 2.4 6 0 2.4-1.2 4.2-2.4 6 1.2 1.2 3.6 2.4 6 2.4 1.8 0 3.6-.6 5.4-1.8" />
      <path d="M2.4 14.4c1.2-1.2 3.6-2.4 6-2.4 2.4 0 4.2 1.2 6 2.4-1.2 1.2-2.4 3.6-2.4 6 0 2.4 1.2 4.2 2.4 6-1.2 1.2-3.6 2.4-6 2.4s-4.8-1.2-6-2.4c1.2-1.2 2.4-3.6 2.4-6 0-2.4-1.2-4.2-2.4-6Z" />
      <path d="M14.4 9.6c-1.2-1.2-2.4-3.6-2.4-6" />
    </svg>
  );
}
