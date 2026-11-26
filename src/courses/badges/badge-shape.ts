/** Points of a notched rosette, the shape of the medal edge */
export const rosette = (cx: number, cy: number, outer: number, inner: number, notches = 12) =>
  Array.from({ length: notches * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / notches - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
