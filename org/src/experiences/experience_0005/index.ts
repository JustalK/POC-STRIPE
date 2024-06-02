import { Elysia } from "elysia";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
}).post("/", async () => {
  const { data } = await stripe.customers.search({
    query: "email:'kevin.whatever@example.com'",
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 2000,
    currency: "usd",
    customer: data[0].id,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  return paymentIntent;
});

export default experience;
