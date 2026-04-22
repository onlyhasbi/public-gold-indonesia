import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

const handler = createStartHandler(defaultStreamHandler);

export default function ssrHandler(event: { req: Request }) {
  try {
    return handler(event.req);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown SSR error";
    const stack = error instanceof Error ? error.stack : "";
    console.error("SSR Error:", message, stack);
    return new Response(
      JSON.stringify({ error: message, stack: stack?.split("\n").slice(0, 5) }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
