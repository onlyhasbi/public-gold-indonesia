import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { API_URL } from "./lib/config";

const handler = createStartHandler(defaultStreamHandler);

export default async function ssrHandler(event: { req: Request }) {
  try {
    const response = await handler(event.req);
    
    // Evaluate the actual API_URL to debug why fetches might be failing
    const info = {
      isResponseObject: response instanceof Response,
      responseType: response?.constructor?.name,
      status: response?.status,
      API_URL: API_URL,
      ENV_API_URL: process.env.API_URL,
    };
    
    return new Response(JSON.stringify(info, null, 2), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
