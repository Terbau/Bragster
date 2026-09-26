import { getSession } from "@/lib/auth";
import type { Session } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export type MobileUser = Session["user"];

type RouteContext<Params> = { params: Promise<Params> };

type Handler<Params> = (
  request: NextRequest,
  context: { user: MobileUser; params: Params },
) => Promise<unknown>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const errorResponse = (status: number, message: string) =>
  NextResponse.json({ error: message }, { status });

const toErrorResponse = (error: unknown) => {
  if (error instanceof ApiError) {
    return errorResponse(error.status, error.message);
  }

  if (error instanceof ZodError) {
    return errorResponse(400, "Invalid input");
  }

  // `redirect("/auth/sign-in")` from a server action means no valid session
  if (
    error instanceof Error &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  ) {
    return errorResponse(401, "Unauthorized");
  }

  // Server actions throw plain errors with user facing messages. Anything else
  // (Prisma, network, ...) is unexpected and should not leak details.
  if (error instanceof Error && error.constructor === Error) {
    if (/not found/i.test(error.message)) {
      return errorResponse(404, error.message);
    }
    if (/not allowed|only signed in/i.test(error.message)) {
      return errorResponse(403, error.message);
    }
    return errorResponse(400, error.message);
  }

  console.error(error);
  return errorResponse(500, "Something went wrong");
};

/**
 * Wraps a mobile API route handler. Requires a valid bearer token, and turns
 * returned values into JSON responses and thrown errors into error responses.
 */
export const withMobileUser =
  <Params = Record<string, never>>(handler: Handler<Params>) =>
  async (request: NextRequest, context: RouteContext<Params>) => {
    try {
      const session = await getSession();
      if (!session?.user) {
        return errorResponse(401, "Unauthorized");
      }

      const result = await handler(request, {
        user: session.user,
        params: await context.params,
      });

      return result instanceof Response
        ? result
        : NextResponse.json(result ?? null);
    } catch (error) {
      return toErrorResponse(error);
    }
  };

export const readJson = async (request: NextRequest): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
};

/** Builds form data for the server actions that take `FormData` */
export const toFormData = (record: Record<string, unknown>) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined && value !== null) {
      formData.set(key, String(value));
    }
  }
  return formData;
};
