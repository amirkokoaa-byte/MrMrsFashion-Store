/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON middleware for POST requests
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Query Generator endpoint
app.post("/api/generate-sql", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `The user wants a MySQL query for their clothing store database.
User Prompt: ${prompt}`,
      config: {
        systemInstruction: `You are an expert MySQL database administrator and systems architect.
The database has 18 tables:
1. roles (id, role_name, description, created_at, updated_at)
2. users (id, role_id, email, password_hash, is_active, created_at, updated_at, deleted_at)
3. customers (id, user_id, first_name, last_name, phone, loyalty_points, created_at, updated_at)
4. addresses (id, customer_id, address_line, city, state, postal_code, country, is_default, created_at, updated_at)
5. categories (id, category_name, parent_id, slug, description, created_at, updated_at)
6. products (id, category_id, product_name, sku, slug, description, price, compare_at_price, is_active, created_at, updated_at, deleted_at)
7. product_images (id, product_id, image_url, is_primary, created_at, updated_at)
8. inventory (id, product_id, quantity, low_stock_threshold, location, created_at, updated_at)
9. carts (id, customer_id, session_token, created_at, updated_at)
10. cart_items (id, cart_id, product_id, quantity, created_at, updated_at)
11. orders (id, order_number, customer_id, coupon_id, subtotal_amount, discount_amount, shipping_cost, tax_amount, net_amount, order_status, created_at, updated_at)
12. order_items (id, order_id, product_id, quantity, unit_price, subtotal, created_at, updated_at)
13. payments (id, order_id, transaction_reference, amount, payment_method, payment_status, created_at, updated_at)
14. shipping (id, order_id, tracking_number, shipping_method, shipping_status, estimated_delivery_date, created_at, updated_at)
15. coupons (id, coupon_code, discount_type, discount_value, min_order_amount, is_active, starts_at, expires_at, created_at, updated_at)
16. reviews (id, customer_id, product_id, rating, comment, is_approved, created_at, updated_at)
17. order_status_history (id, order_id, status_name, changed_by_user_id, notes, created_at)
18. activity_logs (id, user_id, action, ip_address, details, created_at)

Generate a single syntactically correct MySQL 8.0 query that solves the user's request. 
Explain in clear Arabic how the query retrieves or processes the data, detailing any joins or aggregations used.
Return your output strictly as a JSON object with "sql" and "explanation" fields. Do not include markdown code block formatting inside the JSON values.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sql: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["sql", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ 
      error: "Failed to generate SQL", 
      explanation: "عذراً، فشل المساعد في الاتصال بالنموذج. يرجى التحقق من صحة مفتاح GEMINI_API_KEY." 
    });
  }
});

// Setup Vite Dev Server / Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK] Server booted successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
