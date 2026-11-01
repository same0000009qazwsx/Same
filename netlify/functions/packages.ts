import type { Config } from "@netlify/functions";
import { FEE_RATE, PACKAGES } from "../../lib/pricing.js";

export default async () => Response.json({ feeRate: FEE_RATE, packages: PACKAGES });

export const config: Config = { path: "/api/packages" };
