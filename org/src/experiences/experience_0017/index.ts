import { Elysia } from "elysia";
const fs = require("node:fs");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SK);

const dirname = import.meta.dirname;
const folder = dirname.split("/").pop();

export const experience = new Elysia({
  name: folder,
  prefix: `/${folder}`,
}).post("/", async ({ request }) => {
  const fp = fs.readFileSync(dirname + '/profile.jpeg');
  const upload = await stripe.files.create({
    file: {
      data: fp,
      name: 'file.jpg',
      type: 'application.octet-stream',
    },
    purpose: 'dispute_evidence',
  });
  return upload
}).get("/", async ({ request }) => {
  // File id can be obtain from previous post request
  const upload = await stripe.files.retrieve('file_1PQbX1DUINTPsGORpNjg6HIs');
  return upload
}).get("/file/unauthenticated", async ({ request }) => {
  // File id can be obtain from previous post request
  const upload = await stripe.fileLinks.create({
    file: 'file_1PQbX1DUINTPsGORpNjg6HIs',
  });
  return upload
})

export default experience;
