/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

/**
 * Isomorphic Session getter for API requests
 * - Expo requests will have a session token in the Authorization header
 * - Next.js requests will have a session token in cookies
 */
//import type * as trpcExpress from "@trpc/server/adapters/express";
import type { IncomingHttpHeaders } from "http";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

//import type { Session } from "@dumbledoor/auth";
import type { Session } from "@dumbledoor/auth";
import { prisma } from "@dumbledoor/user-db";

// const isomorphicGetSession = async (headers: IncomingHttpHeaders) => {
//   const authToken = headers.authorization ?? null;
//   if (authToken) return validateToken(authToken);
//   return auth();
// };
// const isomorphicGetSession = async (headers: Headers) => {
//   const authToken = headers.get("Authorization") ?? null;
//   if (authToken) return validateToken(authToken);
//   return auth();
// };

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
// export const createTRPCContext = async (opts: {
//   headers: Headers;
//   session: Session | null;
// }) => {
//   console.log(">>> createTRPCContext", opts);
//   const authToken = opts.headers.get("Authorization") ?? null;
//   const session = await isomorphicGetSession(opts.headers);

//   const source = opts.headers.get("x-trpc-source") ?? "unknown";
//   console.log(">>> tRPC Request from", source, "by", session?.user);

//   return {
//     session,
//     token: authToken,
//   };
// };

export const createTRPCContext = (opts: {
  headers: IncomingHttpHeaders;
  session: Session | null;
}) => {
  const authToken = opts.headers.authorization ?? null;
  const session = null;

  const source = opts.headers["x-trpc-source"] ?? "unknown";
  console.log(">>> tRPC Request from", source, "by", session);

  return {
    session,
    prisma,
    token: authToken,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
type Context = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  throw new TRPCError({ code: "UNAUTHORIZED" });

  // if (!ctx.session?.user) {
  //   throw new TRPCError({ code: "UNAUTHORIZED" });
  // }
  // return next({
  //   ctx: {
  //     // infers the `session` as non-nullable
  //     session: { ...ctx.session, user: ctx.session.user },
  //   },
  // });
});
