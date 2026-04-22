export default function handler(event: { req: Request }) {
  return new Response(
    "<!DOCTYPE html><html><body><h1>It works!</h1></body></html>",
    {
      headers: { "content-type": "text/html" },
    },
  );
}
