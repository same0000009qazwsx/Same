import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { orders } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secretKey = Netlify.env.get("TOSS_SECRET_KEY");
  if (!secretKey) return Response.json({ error: "결제 설정이 완료되지 않았습니다." }, { status: 500 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const { paymentKey, orderId } = body;
  const amount = Number(body.amount);
  if (typeof paymentKey !== "string" || typeof orderId !== "string" || !Number.isInteger(amount))
    return Response.json({ error: "결제 정보가 올바르지 않습니다." }, { status: 400 });

  const [order] = await db.select().from(orders).where(eq(orders.code, orderId));
  if (!order) return Response.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  if (order.status === "paid" && order.paymentKey === paymentKey)
    return Response.json({ code: order.code, status: order.status });
  if (order.status !== "pending")
    return Response.json({ error: "이미 처리된 주문입니다." }, { status: 409 });
  // 브라우저에서 넘어온 금액이 아니라 DB에 저장된 주문 금액과 비교
  if (amount !== order.totalPrice)
    return Response.json({ error: "결제 금액이 주문 금액과 일치하지 않습니다." }, { status: 400 });

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(secretKey + ":").toString("base64"),
      "Content-Type": "application/json",
      "Idempotency-Key": paymentKey,
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const payment = await res.json();
  if (!res.ok) {
    return Response.json({ error: payment.message ?? "결제 승인에 실패했습니다.", code: payment.code }, { status: 400 });
  }

  await db
    .update(orders)
    .set({
      status: "paid",
      paymentKey: payment.paymentKey,
      paymentMethod: payment.method ?? null,
      paidAt: payment.approvedAt ? new Date(payment.approvedAt) : new Date(),
    })
    .where(eq(orders.code, orderId));

  return Response.json({ code: order.code, status: "paid", method: payment.method });
};

export const config: Config = { path: "/api/payments/confirm" };
