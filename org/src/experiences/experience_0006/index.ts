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

    const btok = await stripe.tokens.create({
      bank_account: {
        country: "US",
        currency: "usd",
        account_holder_name: "Jenny Rosen",
        account_holder_type: "individual",
        routing_number: "110000000",
        account_number: "000123456789",
      },
    });
    const customerSource = await stripe.customers.createSource(data[0].id, {
      source: btok.id,
    });
    return customerSource;
  })
  .post("/verify", async () => {
    const { data } = await stripe.customers.search({
      query: "email:'kevin.whatever@example.com'",
    });
    const paymentMethods = await stripe.customers.listPaymentMethods(
      data[0].id
    );
    const ba = paymentMethods.data[0];
    const bankAccount = await stripe.customers.verifySource(data[0].id, ba.id, {
      amounts: [32, 45],
    });
    return bankAccount;
  });

export default experience;
