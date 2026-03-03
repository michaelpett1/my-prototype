'use client';

import { useState } from 'react';

export default function DriverAvatar({
  src,
  code,
  teamColor,
  size = 32,
}: {
  src: string;
  code: string;
  teamColor: string;
  size?: number;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: teamColor,
          fontSize: size * 0.33,
        }}
      >
        {code.slice(0, 2)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={code}
      className="rounded-full object-cover bg-[--color-bg-secondary] flex-shrink-0"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}
