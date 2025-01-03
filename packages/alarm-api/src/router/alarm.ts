import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/alarm-db";

import { accessClient, notiClient, protectedProcedure } from "../trpc";

export const adminRouter = {
  getAllAlarms: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = await accessClient.internal.isAdmin.mutate(
      ctx.session.userId,
    );

    if (!isAdmin)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to view alarms",
      });

    const alarms = await prisma.alarm.findMany();
    return alarms;
  }),

  createAlarm: protectedProcedure
    .input(
      z.object({
        alarmname: z.string(),
        doorid: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to create an alarm",
        });

      const alarm = await prisma.alarm.create({
        data: {
          name: input.alarmname,
          door_id: input.doorid,
        },
      });

      await notiClient.internal.sentNotification.mutate({
        notiText: `Created alarm ${alarm.name}`,
      });

      return alarm;
    }),

  deleteAlarm: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await accessClient.internal.isAdmin.mutate(
        ctx.session.userId,
      );

      if (!isAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to delete an alarm",
        });

      const alarm = await prisma.alarm.findUnique({
        where: {
          id: input,
        },
      });

      if (!alarm)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Alarm not found",
        });

      await prisma.alarm.delete({
        where: {
          id: input,
        },
      });

      await notiClient.internal.sentNotification.mutate({
        notiText: `Deleted alarm ${alarm.name}`,
      });

      return alarm;
    }),
} satisfies TRPCRouterRecord;
