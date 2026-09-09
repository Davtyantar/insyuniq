"use client";

import Image from "next/image";
import Tilt from "react-parallax-tilt";

/** Syunik map with a subtle 3D tilt that follows the cursor. */
export function MapTilt() {
  return (
    <Tilt
      className="h-full w-full"
      tiltMaxAngleX={12}
      tiltMaxAngleY={12}
      perspective={1000}
      scale={1.04}
      transitionSpeed={1000}
      glareEnable={false}
    >
      <div className="relative h-full w-full">
        <Image src="/syunik-map.png" alt="" aria-hidden fill className="object-contain" />
      </div>
    </Tilt>
  );
}
