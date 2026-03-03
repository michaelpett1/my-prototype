/**
 * F1 logo — iconic compound red shape with the "1" carved out as negative space.
 * The outer shape forms a bold italic "F" that merges into a right-side block;
 * the "1" is cut from the right portion using fill-rule="evenodd".
 * Three red speed lines sit between the F and 1 inside the shape.
 * All elements in F1 red (#E10600).
 */
export default function F1Logo({
  width = 48,
  className = '',
}: {
  width?: number;
  className?: string;
}) {
  // Aspect ratio based on viewBox
  const height = Math.round(width * (113 / 200));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="F1 Logo"
      role="img"
    >
      {/*
        Compound shape: outer boundary traces the full F1 silhouette,
        inner cutout traces the "1" numeral.
        fill-rule="evenodd" makes the inner path a hole.
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={[
          // --- Outer shape (clockwise) ---
          // Start bottom-left of F stem
          'M 4 109',
          'L 26 4',
          'L 100 4',        // top of F bar
          'L 118 4',        // extend across to right block
          'L 176 4',        // top-right corner
          'L 152 109',      // bottom-right corner
          'L 130 109',      // bottom of "1" right edge
          'L 148 24',       // right block inner top-right
          'L 118 24',       // right block inner top-left (start of 1 area)

          // Speed line cutouts are separate; the "1" area is between the two blocks
          'L 114 40',       // step down past top bar zone
          'L 114 40',
          'L 100 40',       // F top bar bottom-right
          'L 96 56',        // F mid bar top-right
          'L 60 56',        // F mid bar inner join
          'L 54 76',        // F stem mid
          'L 88 76',        // decorative mid area
          'L 86 84',
          'L 48 84',        // back to stem
          'L 40 109',       // F stem bottom-right
          'L 20 109',       // F stem bottom-left
          'Z',

          // --- Inner cutout for "1" (counter-clockwise) ---
          'M 126 28',       // "1" top-left (with serif notch)
          'L 120 50',       // left edge going down
          'L 116 68',       // left edge
          'L 112 86',       // left edge near bottom
          'L 110 96',       // bottom-left of "1"
          'L 134 96',       // bottom-right of "1"
          'L 144 44',       // right edge going up
          'L 148 28',       // top-right of "1"
          'L 138 28',       // narrow top
          'L 132 22',       // serif notch tip
          'L 126 28',       // back to start
          'Z',
        ].join(' ')}
        fill="#E10600"
      />

      {/* Speed lines between F and 1 — horizontal red bars */}
      <rect x="98"  y="42" width="14" height="6" rx="3" fill="#E10600" />
      <rect x="96"  y="54" width="14" height="6" rx="3" fill="#E10600" />
      <rect x="92"  y="66" width="16" height="6" rx="3" fill="#E10600" />
    </svg>
  );
}
