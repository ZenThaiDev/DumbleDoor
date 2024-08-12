import { adminRouter } from "./router/card";
import { internalRouter } from "./router/internal";

import "./router/card";

import { createInternalTRPCRouter, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
});

export const internalAppRouter = createInternalTRPCRouter({
  internal: internalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type InternalAppRouter = typeof internalAppRouter;
