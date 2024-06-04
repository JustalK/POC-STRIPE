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
    const price2 = await stripe.prices.create({
      currency: "usd",
      unit_amount: 2000,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: "Silver Plan",
      },
    });
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
        {
          price: price2.id,
          quantity: 2,
        },
      ],
      allow_promotion_codes: true,
      inactive_message: "This link is not active anymore.",
      automatic_tax: {
        enabled: true,
      },
      currency: "usd",
      custom_fields: [
        {
          key: "customKey1",
          label: {
            custom: "Custom 1",
            type: "custom",
          },
          type: "text",
        },
        {
          key: "customKey2",
          label: {
            custom: "Custom 2",
            type: "custom",
          },
          type: "numeric",
          optional: true,
        },
      ],
      consent_collection: {
        terms_of_service: "required",
      },
      shipping_address_collection: {
        allowed_countries: ["DE", "FR"],
      },
      custom_text: {
        after_submit: {
          message: "Message After Submit",
        },
        shipping_address: {
          message: "Message address",
        },
        submit: {
          message: "Message submit",
        },
        terms_of_service_acceptance: {
          message: "Message Terms of Service",
        },
      },
    });
    return paymentLink;
  })
  .delete("/", async () => {
    const { data: paymentLinks } = await stripe.paymentLinks.list();
    const paymentLink = paymentLinks[0];
    if (paymentLink) {
      const paymentLinkUpdated = await stripe.paymentLinks.update(
        paymentLink.id,
        {
          active: false,
        }
      );
      return paymentLinkUpdated;
    } else {
      return false;
    }
  });

export default experience;
