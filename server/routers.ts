import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM, type Message } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI Chat router for baby simulation
  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await invokeLLM({
            messages: input.messages as Message[],
            maxTokens: 300,
          });

          const content = result.choices[0]?.message?.content;
          const textContent = typeof content === "string" 
            ? content 
            : Array.isArray(content) 
              ? content.find(c => c.type === "text")?.text || ""
              : "";

          return {
            content: textContent,
            success: true,
          };
        } catch (error) {
          console.error("LLM invocation error:", error);
          return {
            content: "I'm here for you, little one. *gently holds you*",
            success: false,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
