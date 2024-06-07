import { Elysia } from "elysia";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
}).post("/", async () => {
  const now = Date.now();
  const new_week = new Date(now + 7 * 24 * 60 * 60 * 1000);
  const testClock = await stripe.testHelpers.testClocks.create({
    name: "Test Clock",
    frozen_time: new_week,
  });
  return testClock;
});

export default experience;
