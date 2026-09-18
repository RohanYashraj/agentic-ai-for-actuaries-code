/** The cover's square grid, drawn as an inline SVG. A fixed pattern so it
 * is the same mark everywhere: slate tiles with a scatter of gold. `tone`
 * picks the slate value for a light or a dark background. */
const PATTERN = [
  "sssgsss",
  "ssssgss",
  "gssssgs",
  "sgsssss",
  "ssgssss",
  "sssssgs",
  "gsssgss",
  "ssgssgs",
];

export function GridMotif({
  tone = "light",
  tile = 14,
  gap = 4,
  rows = PATTERN.length,
  className,
}: {
  tone?: "light" | "dark";
  tile?: number;
  gap?: number;
  rows?: number;
  className?: string;
}) {
  const cols = PATTERN[0].length;
  const step = tile + gap;
  const slate = tone === "dark" ? "#2a3d5e" : "#d9d5c9";
  const gold = "#e4a531";
  const width = cols * step - gap;
  const height = rows * step - gap;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
    >
      {PATTERN.slice(0, rows).flatMap((row, y) =>
        [...row].map((cell, x) => (
          <rect
            key={`${x}-${y}`}
            x={x * step}
            y={y * step}
            width={tile}
            height={tile}
            rx={1.5}
            fill={cell === "g" ? gold : slate}
          />
        ))
      )}
    </svg>
  );
}
