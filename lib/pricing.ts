// 2026년 한국 서버 공식 VP 가격 (원)
export const FEE_RATE = 0.15;

export const BASE_PACKAGES = [
  { id: "vp-475", vp: 475, basePrice: 6500 },
  { id: "vp-1000", vp: 1000, basePrice: 13000 },
  { id: "vp-2050", vp: 2050, basePrice: 26000 },
  { id: "vp-3650", vp: 3650, basePrice: 45000 },
  { id: "vp-5350", vp: 5350, basePrice: 65000 },
  { id: "vp-11000", vp: 11000, basePrice: 130000 },
];

export const PACKAGES = BASE_PACKAGES.map((p) => {
  const fee = Math.round(p.basePrice * FEE_RATE);
  return { ...p, fee, totalPrice: p.basePrice + fee };
});
