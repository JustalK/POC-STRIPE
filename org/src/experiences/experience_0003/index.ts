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
    const { data } = await stripe.customers.search({
      query: "email:'kevin.whatever@example.com'",
    });
    const card = await stripe.customers.createSource(data[0].id, {
      source: "tok_visa",
    });
    const paymentAttach = await stripe.paymentMethods.attach(card.id, {
      customer: data[0].id,
    });
    return paymentAttach;
  })
  .delete("/", async () => {
    const { data } = await stripe.customers.search({
      query: "email:'kevin.whatever@example.com'",
    });
    const paymentMethods = await stripe.customers.listPaymentMethods(
      data[0].id
    );
    for (const pm of paymentMethods.data) {
      await stripe.paymentMethods.detach(pm.id);
    }
    return paymentMethods;
  });

export default experience;
