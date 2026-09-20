import type { SVGProps } from "react";

/** The Gemini four-point star, in the brand's blue-to-pink sweep. Sized by
 * `size` like a Phosphor icon so the two families sit together in chips. */
export function GeminiLogo({
  size = 16,
  className,
  ...rest
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="gemini-sweep" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#1C7DF2" />
          <stop offset="55%" stopColor="#8E75D6" />
          <stop offset="100%" stopColor="#E8629A" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z"
        fill="url(#gemini-sweep)"
      />
    </svg>
  );
}

/** Google Colab's two linked rings, in Colab yellow. */
export function ColabLogo({
  size = 16,
  className,
  ...rest
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <circle cx="7.5" cy="12" r="5" stroke="#F9AB00" strokeWidth="2.6" />
      <circle cx="16.5" cy="12" r="5" stroke="#F9AB00" strokeWidth="2.6" />
    </svg>
  );
}
