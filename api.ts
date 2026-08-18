// api.ts
// Deno 代理：从上游获取实时二维码并返回给前端。
// 使用方法：在部署环境中设置环境变量 WXAPPCHATID，然后运行（Deno Deploy / Deno 实例）。

Deno.serve(async (_req) => {
  try {
    const WXAPPCHATID = Deno.env.get("WXAPPCHATID");

    if (!WXAPPCHATID) {
      return new Response(
        JSON.stringify({
          status: 500,
          message: "WXAPPCHATID_NOT_CONFIGURED",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const upstream = await fetch(
      "https://www.forzadata.cn/api/wxApp/5878/myQr/v2",
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "WXAPPCHATID": WXAPPCHATID.trim(),
        },
      },
    );

    const result = await upstream.json();

    if (result.status !== 0 || !result.data?.qr) {
      return new Response(
        JSON.stringify({
          status: result.status ?? upstream.status,
          message: result.message || "QR_REQUEST_FAILED",
        }),
        {
          status: upstream.ok ? 502 : upstream.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    // 只返回二维码，避免把上游其他字段暴露出去
    return new Response(
      JSON.stringify({
        status: 0,
        qr: result.data.qr,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 500,
        message: error instanceof Error ? error.message : "SERVER_ERROR",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      },
    );
  }
});
