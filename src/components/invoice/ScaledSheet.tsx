"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scales a fixed-width A4 invoice sheet down to fit narrow phone screens.
 * Desktop shows it at full size; print CSS resets the transform.
 */
export default function ScaledSheet({ children }: { children: React.ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState<number | undefined>(undefined);

  useEffect(() => {
    const box = boxRef.current;
    const sheet = sheetRef.current;
    if (!box || !sheet) return;

    const update = () => {
      const naturalW = sheet.offsetWidth || 1;
      const availW = box.clientWidth || naturalW;
      const s = Math.min(1, availW / naturalW);
      setScale(s);
      setBoxH(sheet.offsetHeight * s);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="invoice-scale-box w-full" style={{ height: boxH }}>
      <div
        ref={sheetRef}
        className="invoice-scale"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
