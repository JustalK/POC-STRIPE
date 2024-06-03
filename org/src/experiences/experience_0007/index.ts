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
    const product = await stripe.products.create({
      name: "Product1",
      description: "This is a product test",
      id: "product-1",
      metadata: {
        option1: "t1",
        option2: "t2",
      },
      default_price_data: {
        currency: "EUR",
        recurring: {
          interval: "month",
          interval_count: 3,
        },
        tax_behavior: "inclusive",
        unit_amount_decimal: 2500,
        currency_options: {
          usd: {
            unit_amount_decimal: 2412,
          },
        },
      },
      marketing_features: [
        {
          name: "feature1",
        },
        {
          name: "feature2",
        },
        {
          name: "feature3",
        },
      ],
      shippable: false,
      tax_code: "txcd_20030000",
      url: "http://example.com",
    });
    return product;
  })
  .post("/multi", async () => {
    const all = [];
    for (const i of [1, 2, 3]) {
      all.push(
        stripe.products.create({
          name: `Product${i}`,
          description: `This is a product test ${i}`,
          id: `product-${i}`,
        })
      );
    }
    const result = Promise.all(all);
    return result;
  })
  .get("/", async () => {
    const product = await stripe.products.retrieve("product-1");
    return product;
  })
  .get("/price", async () => {
    const product = await stripe.products.retrieve("product-1");
    if (product.default_price) {
      const price = await stripe.prices.retrieve(product.default_price);
      return price;
    } else {
      return false;
    }
  })
  .get("/key", async () => {
    const prices = await stripe.prices.list({
      lookup_keys: ["gold"],
      limit: 1,
    });
    return prices;
  })
  .get("/list", async () => {
    const products = await stripe.products.list({
      active: true,
    });
    return products;
  })
  .patch("/", async () => {
    const product = await stripe.products.update("product-1", {
      metadata: {
        option1: "u1",
        option2: "u2",
      },
    });
    return product;
  })
  .patch("/key", async () => {
    const product = await stripe.products.retrieve("product-1");
    if (product.default_price) {
      const price = await stripe.prices.update(product.default_price, {
        lookup_key: "gold",
      });
      return price;
    }
    return false;
  })
  .patch("/price", async () => {
    const product = await stripe.products.retrieve("product-1");
    const oldPriceId = product.default_price;
    if (product.default_price) {
      // Create a new price and transfert the key
      const price = await stripe.prices.create({
        currency: "eur",
        unit_amount_decimal: 1012,
        recurring: {
          interval: "month",
        },
        product: "product-1",
        lookup_key: "gold",
        transfer_lookup_key: true,
      });
      // Change the default price
      await stripe.products.update("product-1", {
        default_price: price.id,
      });
      // Desactivate the previous price
      await stripe.prices.update(oldPriceId, {
        active: false,
      });
      return price;
    }
    return false;
  })
  .delete("/", async () => {
    // Impossible to delete without passing through the stripe website, just archive it
    const product = await stripe.products.retrieve("product-1");
    await stripe.products.update("product-1", {
      active: false,
    });
    if (product.default_price) {
      const price = await stripe.prices.retrieve(product.default_price);
      await stripe.prices.update(product.default_price, {
        active: false,
      });
    }
    return true;
  });

export default experience;
