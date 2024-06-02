import { Elysia } from "elysia";
import { Glob } from "bun";

/**
 * Add all the experience - lazy loading
 */
export const loadStatic = async (app: Elysia) => {
  const glob = new Glob("src/experiences/**/index.{ts,tsx}");
  for (const file of glob.scanSync({ cwd: ".", absolute: true })) {
    console.log(file);
    app.use(import(file));
  }

  return app;
};

const experiences = new Elysia().use(loadStatic);

export const app = new Elysia().use(experiences).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
