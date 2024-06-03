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
    const shippingRate = await stripe.shippingRates.create({
      display_name: "Custom Shipping Rate",
      type: "fixed_amount",
      tax_behavior: "inclusive",
      delivery_estimate: {
        maximum: {
          unit: "day",
          value: 5,
        },
        minimum: {
          unit: "day",
          value: 1,
        },
      },
      fixed_amount: {
        amount: 500,
        currency: "usd",
      },
    });
    return shippingRate;
  })
  .post("/code", async () => {
    const taxCode = await stripe.taxCodes.retrieve("txcd_99999999");
    const shippingRate = await stripe.shippingRates.create({
      display_name: "Custom Shipping Rate 2",
      tax_code: taxCode.id,
      type: "fixed_amount",
      tax_behavior: "inclusive",
      delivery_estimate: {
        maximum: {
          unit: "day",
          value: 5,
        },
        minimum: {
          unit: "day",
          value: 1,
        },
      },
      fixed_amount: {
        amount: 500,
        currency: "usd",
      },
    });
    return shippingRate;
  })
  .patch("/", async () => {
    const { data: shippingRates } = await stripe.shippingRates.list({
      active: true,
    });
    const shippingRate = shippingRates[0];
    if (shippingRate) {
      const shippingRateUpdated = await stripe.shippingRates.update(
        shippingRate.id,
        {
          active: false,
        }
      );
      return shippingRateUpdated;
    } else {
      return false;
    }
  });

export default experience;
