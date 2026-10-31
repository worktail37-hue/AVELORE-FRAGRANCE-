"use client";

import React from "react";
import { WorksWheel, WorksWheelItem } from "./works-wheel";

const DEMO_ITEMS: WorksWheelItem[] = [
  {
    title: "Solène Extrait",
    subtitle: "Extrait de Parfum · Amber Floral",
    price: "$285",
    badge: "Maison Signature",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240' width='100%' height='100%'><rect width='100%' height='100%' rx='20' fill='%23FFFBF5'/><rect x='60' y='50' width='80' height='120' rx='10' fill='%23E5A967'/><rect x='85' y='25' width='30' height='25' rx='4' fill='%231C1A18'/><text x='100' y='185' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%233B0000' font-weight='bold'>SOLÈNE</text></svg>",
  },
  {
    title: "Ambre Impérial",
    subtitle: "Extrait de Parfum · Resinous Woody",
    price: "$340",
    badge: "Rare Reserve",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240' width='100%' height='100%'><rect width='100%' height='100%' rx='20' fill='%23FFFBF5'/><rect x='60' y='50' width='80' height='120' rx='10' fill='%238B4513'/><rect x='85' y='25' width='30' height='25' rx='4' fill='%231C1A18'/><text x='100' y='185' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%233B0000' font-weight='bold'>AMBRE</text></svg>",
  },
  {
    title: "Rose Sépale",
    subtitle: "Eau de Parfum · Green Dew Centifolia",
    price: "$260",
    badge: "Dawn Harvest",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240' width='100%' height='100%'><rect width='100%' height='100%' rx='20' fill='%23FFFBF5'/><rect x='60' y='50' width='80' height='120' rx='10' fill='%23D47A88'/><rect x='85' y='25' width='30' height='25' rx='4' fill='%231C1A18'/><text x='100' y='185' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%233B0000' font-weight='bold'>ROSE SÉPALE</text></svg>",
  },
  {
    title: "Vétiver Céleste",
    subtitle: "Extrait de Parfum · Smoked Earth",
    price: "$275",
    badge: "Organic",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240' width='100%' height='100%'><rect width='100%' height='100%' rx='20' fill='%23FFFBF5'/><rect x='60' y='50' width='80' height='120' rx='10' fill='%236B7C59'/><rect x='85' y='25' width='30' height='25' rx='4' fill='%231C1A18'/><text x='100' y='185' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%233B0000' font-weight='bold'>VÉTIVER</text></svg>",
  },
  {
    title: "Oud Minérale",
    subtitle: "Extrait de Parfum · Coastal Smoked Agar",
    price: "$360",
    badge: "Rare Reserve",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240' width='100%' height='100%'><rect width='100%' height='100%' rx='20' fill='%23FFFBF5'/><rect x='60' y='50' width='80' height='120' rx='10' fill='%234A3E3D'/><rect x='85' y='25' width='30' height='25' rx='4' fill='%231C1A18'/><text x='100' y='185' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%233B0000' font-weight='bold'>OUD MINÉRALE</text></svg>",
  },
];

export function WorksWheelDemo() {
  return (
    <div className="w-full h-screen bg-[#FAF2E1] text-[#3B0000] p-6">
      <WorksWheel
        items={DEMO_ITEMS}
        label="Flacons '26"
        action="Quick View"
        className="h-full rounded-2xl"
      />
    </div>
  );
}

export default WorksWheelDemo;
