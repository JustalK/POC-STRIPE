import { Elysia } from "elysia";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
})
  .post("/", async () => {
    const coupon = await stripe.coupons.create({
      name: "My coupon",
      duration: "repeating",
      duration_in_months: 3,
      percent_off: 25.5,
      redeem_by: 1720000414,
    });
    return coupon;
  })
  .post("/amount", async () => {
    const coupon = await stripe.coupons.create({
      duration: "forever",
      amount_off: 100,
      currency: "eur",
      currency_options: {
        usd: {
          amount_off: 150,
        },
      },
      max_redemptions: 20,
    });
    return coupon;
  })
  .post("/onproduct", async () => {
    // Get the product to apply the coupon or create the product
    let product;
    try {
      product = await stripe.products.retrieve("product-1");
    } catch (_error) {
      product = await stripe.products.create({
        name: "Product1",
        description: "This is a product test",
        id: "product-1",
        metadata: {
          option1: "t1",
          option2: "t2",
        },
        default_price_data: {
          currency: "EUR",
          recurring: {
            interval: "month",
            interval_count: 3,
          },
          tax_behavior: "inclusive",
          unit_amount_decimal: 2500,
          currency_options: {
            usd: {
              unit_amount_decimal: 2412,
            },
          },
        },
        marketing_features: [
          {
            name: "feature1",
          },
          {
            name: "feature2",
          },
          {
            name: "feature3",
          },
        ],
        shippable: false,
        tax_code: "txcd_20030000",
        url: "http://example.com",
      });
    }

    const coupon = await stripe.coupons.create({
      id: "coupon-product-1",
      duration: "once",
      percent_off: 25.5,
      applies_to: {
        products: [product.id],
      },
    });
    return coupon;
  })
  .patch("/", async () => {
    const coupon = await stripe.coupons.retrieve("coupon-product-1");
    const couponUpdated = await stripe.coupons.update(coupon.id, {
      name: "Coupon Product 1",
    });
    return couponUpdated;
  })
  .delete("/", async () => {
    const { data: coupons } = await stripe.coupons.list({
      limit: 10,
    });
    let promises = [];
    for (const coupon of coupons) {
      promises.push(stripe.coupons.del(coupon.id));
    }
    const result = await Promise.all(promises);
    return result;
  });

export default experience;
