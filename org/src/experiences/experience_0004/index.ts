import { Elysia } from "elysia";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
}).get("/", async () => {
  const { data } = await stripe.customers.search({
    query: "email:'kevin.whatever@example.com'",
  });
  const paymentMethods = await stripe.customers.listPaymentMethods(data[0].id);
  const paymentMethodsByDefault = paymentMethods.data.find(
    (pm: any) => pm.id === data[0].default_source
  );
  return paymentMethodsByDefault;
});

export default experience;
