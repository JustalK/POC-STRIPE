import { Elysia } from "elysia";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
}).post("/", async () => {
  const meter = await stripe.billing.meters.create({
    display_name: 'Experience 0016',
    event_name: 'ai_search_api',
    default_aggregation: {
      formula: 'sum',
    },
    value_settings: {
      event_payload_key: 'tokens',
    },
    customer_mapping: {
      type: 'by_id',
      event_payload_key: 'stripe_customer_id',
    },
  });
  return meter;
}).get("/products", async () => {
  const { data: products } = await stripe.products.list({
    limit: 20,
  });
  const result = products.find(p => p.name === "Experience_0016")
  return result;
}).post("/customer", async () => {
  const customer = await stripe.customers.create({
    name: 'Experience0016',
  });
  const { data: products } = await stripe.products.list({
    limit: 20,
  });
  const product = products.find(p => p.name === "Experience_0016")
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: product.default_price,
      },
    ],
    expand: ['pending_setup_intent'],
  });
  return subscription;
}).post("/usage", async () => {
  const { data } = await stripe.customers.search({
    query: `name:'Experience0016'`,
  });
  const meterEvent = await stripe.billing.meterEvents.create({
    event_name: 'ai_search_api',
    payload: {
      tokens: 50,
      stripe_customer_id: data[0].id,
    },
  });
  return meterEvent;
});

export default experience;
