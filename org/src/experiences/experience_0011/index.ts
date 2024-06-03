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
    const taxRate = await stripe.taxRates.create({
      display_name: "VAT",
      description: "VAT France",
      percentage: 16,
      jurisdiction: "FR",
      inclusive: false,
      tax_type: "gst",
    });
    return taxRate;
  })
  .patch("/", async () => {
    const { data: taxRates } = await stripe.taxRates.list();
    const taxRate = taxRates[0];
    if (taxRate) {
      const taxRateUpdated = await stripe.taxRates.update(taxRate.id, {
        active: false,
      });
      return taxRateUpdated;
    } else {
      return false;
    }
  });

export default experience;
