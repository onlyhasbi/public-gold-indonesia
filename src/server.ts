export default function ssrHandler(event: any) {
  try {
    const info = {
      eventKeys: Object.keys(event),
      hasReq: !!event.req,
      hasNode: !!event.node,
      hasWeb: !!event.web,
      hasRequest: !!event.request,
      reqType: event.req?.constructor?.name,
      requestType: event.request?.constructor?.name,
      nodeReqType: event.node?.req?.constructor?.name,
      path: event.path,
      method: event.method,
    };
    return new Response(JSON.stringify(info, null, 2), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(String(err), { status: 500 });
  }
}
