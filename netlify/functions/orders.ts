import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../../db/index.js";
import { orders } from "../../db/schema.js";
import { PACKAGES } from "../../lib/pricing.js";

const RIOT_ID = /^[^#]{2,16}#[A-Za-z0-9가-힣]{2,5}$/;

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const publicView = (o: typeof orders.$inferSelect) => ({
  code: o.code,
  vp: o.vp,
  basePrice: o.basePrice,
  fee: o.fee,
  totalPrice: o.totalPrice,
  recipientRiotId: o.recipientRiotId,
  status: o.status,
  createdAt: o.createdAt,
});

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const code = clean(context.params.code, 20).toUpperCase();
    if (!code) return Response.json({ error: "주문번호가 필요합니다." }, { status: 400 });
    const [order] = await db.select().from(orders).where(eq(orders.code, code));
    if (!order) return Response.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    return Response.json(publicView(order));
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const pkg = PACKAGES.find((p) => p.id === body.packageId);
    const buyerName = clean(body.buyerName, 50);
    const buyerContact = clean(body.buyerContact, 100);
    const recipientRiotId = clean(body.recipientRiotId, 30);
    const message = clean(body.message, 200);

    if (!pkg) return Response.json({ error: "상품을 선택해 주세요." }, { status: 400 });
    if (!buyerName || !buyerContact)
      return Response.json({ error: "보내는 분 이름과 연락처를 입력해 주세요." }, { status: 400 });
    if (!RIOT_ID.test(recipientRiotId))
      return Response.json({ error: "받는 분 Riot ID를 '닉네임#태그' 형식으로 입력해 주세요." }, { status: 400 });

    const code = "VP" + randomBytes(4).toString("hex").toUpperCase();
    const [order] = await db
      .insert(orders)
      .values({
        code,
        packageId: pkg.id,
        vp: pkg.vp,
        basePrice: pkg.basePrice,
        fee: pkg.fee,
        totalPrice: pkg.totalPrice,
        buyerName,
        buyerContact,
        recipientRiotId,
        message,
      })
      .returning();

    return Response.json(publicView(order), { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: ["/api/orders", "/api/orders/:code"] };
