import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const meetsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      location: z.string(),
      date: z.string(),
      images: z.array(z.string()),
      tags: z.array(z.string()),
      type: z.enum(["VIRTUAL", "IN_PERSON"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.prisma.event.create({
        data: {
          name: input.name,
          description: input.description,
          locationName: input.location,
          date: new Date(input.date),
          type: input.type,
          images: input.images,
          tags: input.tags,

          coordinator: {
            connect: {
              email: ctx.session.user.email!
            }
          }
        }
      });

      return data.id;
    }),

  events: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().optional(),
      sortBy: z.enum(["DATE_POSTED", "EVENT_DATE"]).optional(),
      registered: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const cursor = input.cursor;

      const sortBy = input.sortBy ?? "DATE_POSTED";
      const prismaOrderBy = {} as {
        createdAt?: "asc" | "desc";
        date?: "asc" | "desc";
      }

      if (sortBy === "DATE_POSTED") {
        prismaOrderBy["createdAt"] = "desc";
      } else if (sortBy === "EVENT_DATE") {
        prismaOrderBy["date"] = "desc";
      }

      const data = await ctx.prisma.event.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: prismaOrderBy,

        where: {
          ...((input.registered && ctx.session) ? {
            attendees: {
              some: {
                email: ctx.session.user.email!
              }
            }
          } : {})
        },

        include: {
          coordinator: {
            select: {
              name: true,
              profilePicture: true
            }
          },

          ...(ctx.session ? {
            attendees: {
              where: {
                email: ctx.session?.user.email!
              },

              select: {
                email: true
              }
            }
          } : {})
        },
      });

      let last: string | null = null;
      if (data.length > limit) {
        last = data.pop()!.id;
      }

      const attendees = await Promise.all(data.map(async (event) => {
        const data = await ctx.prisma.user.count({
          where: {
            attendingEvents: {
              id: event.id
            }
          },
        });

        return data;
      }));

      const combined = data.map((event, index) => {
        return {
          ...event,
          numAttendees: attendees[index] ?? 0,
        }
      });

      return {
        data: combined,
        hasMore: !!last,
        cursor: last,
      };
    }),

  register: protectedProcedure
    .input(z.object({
      eventId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: {
          email: ctx.session.user.email!
        },
        data: {
          attendingEvents: {
            connect: {
              id: input.eventId
            }
          }
        }
      });

      return true;
    }),
});
