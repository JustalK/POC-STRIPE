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
    const customer = await stripe.customers.create({
      name: "Kevin Whatever",
      email: "kevin.experience0014@example.com",
      metadata: {
        firstname: "Kevin",
        lastname: "whatever",
      },
    });
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: 5000,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: "Gold Plan",
      },
    });

    const now = Date.now();
    const trial_end = new Date(now + 24 * 60 * 60 * 1000);
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: price.id,
        },
      ],
      payment_behavior: "allow_incomplete",
      pending_invoice_item_interval: {
        interval: "week",
        interval_count: 4,
      },
      billing_cycle_anchor_config: {
        day_of_month: 1,
      },
      days_until_due: 7,
      collection_method: "send_invoice",
      trial_end: trial_end,
      proration_behavior: "create_prorations",
      trial_settings: {
        end_behavior: {
          missing_payment_method: "create_invoice",
        },
      },
    });
    return subscription;
  })
  .post("/schedule", async () => {
    const { data: customers } = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const subscriptions = await stripe.subscriptions.list({
      customer: customers[0].id,
    });

    const price3 = await stripe.prices.create({
      currency: "usd",
      unit_amount: 123456,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: "Gold Plan",
      },
    });

    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
      customer: customers[0].id,
      start_date: "now",
      end_behavior: "release",
      phases: [
        {
          items: [
            {
              price: price3.id,
              quantity: 5,
            },
          ],
          iterations: 12,
        },
      ],
    });
    return subscriptionSchedule;
  })
  .post("/schedule/futur", async () => {
    const { data: customers } = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const subscriptions = await stripe.subscriptions.list({
      customer: customers[0].id,
    });

    const price3 = await stripe.prices.create({
      currency: "usd",
      unit_amount: 32145,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: "Gold Plan",
      },
    });

    const now = Date.now();
    const start_date = new Date(now + 24 * 60 * 60 * 1000);
    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
      customer: customers[0].id,
      start_date: start_date,
      end_behavior: "release",
      phases: [
        {
          items: [
            {
              price: price3.id,
              quantity: 1,
            },
          ],
          iterations: 5,
        },
      ],
    });
    return subscriptionSchedule;
  })
  .patch("/schedule/futur", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const { data: subscriptionSchedules } =
      await stripe.subscriptionSchedules.list({
        customer: customer.id,
      });
    const subscriptionSchedulesNotStarted = subscriptionSchedules.find(
      (s: { status: string }) => s.status === "not_started"
    );

    const now = Date.now();
    const new_week = new Date(now + 7 * 24 * 60 * 60 * 1000);
    const subscriptionSchedule = await stripe.subscriptionSchedules.update(
      subscriptionSchedulesNotStarted.id,
      {
        phases: [
          {
            items: [
              {
                price: subscriptionSchedulesNotStarted.phases[0].items[0].price,
              },
            ],
            start_date: new_week,
          },
        ],
      }
    );
    return subscriptionSchedule;
  })
  .delete("/schedule/futur", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const { data: subscriptionSchedules } =
      await stripe.subscriptionSchedules.list({
        customer: customer.id,
      });
    const subscriptionSchedulesNotStarted = subscriptionSchedules.find(
      (s: { status: string }) => s.status === "not_started"
    );
    const subscriptionSchedule = await stripe.subscriptionSchedules.cancel(
      subscriptionSchedulesNotStarted.id
    );
    return subscriptionSchedule;
  })
  .get("/list", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
    });
    return subscriptions;
  })
  .put("/item", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
    });
    const subscription = subscriptions.data[0];
    const price2 = await stripe.prices.create({
      currency: "usd",
      unit_amount: 10000,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: "Gold Plan",
      },
    });
    const subscriptionItem = await stripe.subscriptionItems.create({
      subscription: subscription.id,
      price: price2.id,
      quantity: 10,
    });
    return subscriptionItem;
  })
  .delete("/item", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
    });
    const subscription = subscriptions.data[0];
    const subscriptionItems = await stripe.subscriptionItems.list({
      subscription: subscription.id,
    });
    const deletedItem = await stripe.subscriptionItems.del(
      subscriptionItems.data[0].id
    );
    return deletedItem;
  })
  .post("/cancel", async () => {
    const customer = await stripe.customers.search({
      query: `email:'kevin.experience0014@example.com'`,
    });
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
    });

    const promises = [];
    for (const subscription of subscriptions) {
      promises.push(await stripe.subscriptions.cancel(subscription.id));
    }

    const result = await Promise.all(promises);
    return result;
  });

export default experience;
