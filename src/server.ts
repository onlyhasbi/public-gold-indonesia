import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

const handler = createStartHandler(defaultStreamHandler);

export default async function ssrHandler(event: { req: Request }) {
  try {
    const response = await handler(event.req);
    
    // Instead of returning the response directly, inspect it:
    const info = {
      isResponseObject: response instanceof Response,
      responseType: response?.constructor?.name,
      status: response?.status,
      headers: response?.headers ? Array.from((response.headers as Headers).entries()) : [],
    };
    
    return new Response(JSON.stringify(info, null, 2), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
