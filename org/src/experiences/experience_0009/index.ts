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
      name: "Experience 0009",
      id: "experience-0009",
      duration: "forever",
      amount_off: 100,
      currency: "eur",
      currency_options: {
        usd: {
          amount_off: 150,
        },
      },
    });
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: "SPECIAL",
      active: true,
      max_redemptions: 1,
    });
    return promotionCode;
  })
  .post("/oncustomer", async () => {
    const coupon = await stripe.coupons.retrieve("experience-0009");
    const customer = await stripe.customers.create({
      name: "Kevin Whatever",
      email: "kevin.whatever@example.com",
      metadata: {
        firstname: "Kevin",
        lastname: "whatever",
      },
    });
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      customer: customer.id,
      code: "SPECIALCUSTOMER",
      active: true,
      max_redemptions: 1,
      restrictions: {
        first_time_transaction: true,
        minimum_amount: 100,
        minimum_amount_currency: "USD",
      },
    });
    return promotionCode;
  })
  .get("/", async () => {
    const promotionCode = await stripe.promotionCodes.list({
      code: "SPECIALCUSTOMER",
    });

    return promotionCode;
  });

export default experience;
