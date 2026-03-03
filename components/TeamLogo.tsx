'use client';

import { useState } from 'react';

export default function TeamLogo({
  src,
  name,
  color,
  size = 24,
}: {
  src: string;
  name: string;
  color: string;
  size?: number;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className="rounded flex items-center justify-center flex-shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: color + '22',
        }}
      >
        <span
          className="rounded-full"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            backgroundColor: color,
          }}
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="object-contain flex-shrink-0"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}
