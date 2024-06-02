import { Elysia } from "elysia";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
})
  .put("/", async () => {
    const { data } = await stripe.customers.search({
      query: `email:'kevin.whatever@example.com'`,
    });
    const customer = await stripe.customers.update(data[0].id, {
      metadata: {
        firstname: "changed",
      },
    });
    return customer;
  })
  .post("/one", async () => {
    const customer = await stripe.customers.create({
      name: "Kevin Whatever",
      email: "kevin.whatever@example.com",
      metadata: {
        firstname: "Kevin",
        lastname: "whatever",
      },
    });
    return customer;
  })
  .post("/", async () => {
    const all: Promise<unknown>[] = [];
    const users = [
      {
        name: "Kevin Whatever1",
        email: "kevin.whatever1@example.com",
      },
      {
        name: "Kevin Whatever2",
        email: "kevin.whatever2@example.com",
      },
      {
        name: "Kevin Whatever3",
        email: "kevin.whatever3@example.com",
      },
    ];
    for (const { email, name } of users) {
      const promise = new Promise(async (resolve) => {
        const { data } = await stripe.customers.search({
          query: `email:'${email}'`,
        });
        console.log(email, data);
        if (data.length === 0) {
          const newCustomer = stripe.customers.create({
            name,
            email,
          });
          return resolve(newCustomer);
        } else {
          return resolve(false);
        }
      });
      all.push(promise);
    }
    const result = await Promise.all(all);
    return result;
  })
  .get("/search/email", async () => {
    const customers = await stripe.customers.search({
      query: "email:'kevin.whatever@example.com'",
    });
    return customers;
  })
  .delete("/", async () => {
    const all: Promise<unknown>[] = [];
    const { data: customers } = await stripe.customers.search({
      query: "name~'kevin'",
    });
    console.log(customers);
    for (const customer of customers) {
      all.push(stripe.customers.del(customer.id));
    }
    const result = await Promise.all(all);
    return result;
  });

export default experience;
