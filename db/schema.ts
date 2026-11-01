import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial().primaryKey(),
  code: text().notNull().unique(),
  packageId: text("package_id").notNull(),
  vp: integer().notNull(),
  basePrice: integer("base_price").notNull(),
  fee: integer().notNull(),
  totalPrice: integer("total_price").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerContact: text("buyer_contact").notNull(),
  recipientRiotId: text("recipient_riot_id").notNull(),
  message: text().notNull().default(""),
  status: text().notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});
