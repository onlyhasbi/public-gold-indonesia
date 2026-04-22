import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

const handler = createStartHandler(defaultStreamHandler);

export default async function ssrHandler(event: { req: Request }) {
  try {
    const response = await handler(event.req);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    console.error("SSR Error:", message, stack);
    return new Response(
      JSON.stringify({
        ssrError: message,
        stack: stack?.split("\n").slice(0, 8),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
