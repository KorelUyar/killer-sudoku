// Tiny wrapper to translate exceptions into JSON HTTP responses.
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HttpError } from './auth';

export type Handler<T = unknown> = (req: Request, ctx: T) => Promise<NextResponse>;

export function withErrors<T = unknown>(handler: Handler<T>): Handler<T> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', issues: err.flatten().fieldErrors },
          { status: 400 },
        );
      }
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (process.env.NODE_ENV === 'development') {
        console.error('[API error]', err);
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  };
}
