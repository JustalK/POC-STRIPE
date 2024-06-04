import { Elysia } from "elysia";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const path = `${import.meta.dir}/file.pdf`;
const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
})
  .post("/", async () => {
    const customer = await stripe.customers.create({
      name: "Kevin Whatever",
      email: "kevin.experience0013@example.com",
      metadata: {
        firstname: "Kevin",
        lastname: "whatever",
      },
    });
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: 1000,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: "Gold Plan",
      },
    });
    const quote = await stripe.quotes.create({
      customer: customer.id,
      line_items: [
        {
          price: price.id,
          quantity: 2,
        },
      ],
    });
    return quote;
  })
  .get("/list", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0013@example.com'`,
    });
    const quotes = await stripe.quotes.list({
      customer: customer.id,
    });
    return quotes;
  })
  .post("/finalize", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0013@example.com'`,
    });
    const { data: quotes } = await stripe.quotes.list({
      customer: customer.id,
      status: "draft",
    });

    const promises = [];
    for (const quote of quotes) {
      try {
        const q = await stripe.quotes.retrieve(quote.id);
        promises.push(stripe.quotes.finalizeQuote(q.id));
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    const result = await Promise.all(promises);
    return result;
  })
  .post("/accept", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0013@example.com'`,
    });
    const { data: quotes } = await stripe.quotes.list({
      customer: customer.id,
      status: "open",
    });

    const promises = [];
    for (const quote of quotes) {
      try {
        const q = await stripe.quotes.retrieve(quote.id);
        promises.push(stripe.quotes.accept(q.id));
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    const result = await Promise.all(promises);
    return result;
  })
  .post("/pdf", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0013@example.com'`,
    });
    const { data: quotes } = await stripe.quotes.list({
      customer: customer.id,
      status: "accepted",
    });
    return stripe.quotes.pdf(quotes[0].id, (err, res) => {
      if (err) {
        return err; // Handle error/callbacks as needed
      }
      const file = Bun.file(path);
      const writer = file.writer();
      res.on("data", (chunk: any) => writer.write(chunk));
      res.on("error", err);
      res.on("end", () => {
        writer.flush();
        writer.end();
      });
    });
  });

export default experience;
