export default async function handler(req, res) {
  try {
    const WXAPPCHATID = process.env.WXAPPCHATID;

    if (!WXAPPCHATID) {
      return res.status(500).json({
        status: 500,
        message: "WXAPPCHATID_NOT_CONFIGURED"
      });
    }

    const upstream = await fetch(
      "https://www.forzadata.cn/api/wxApp/5878/myQr/v2",
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "WXAPPCHATID": WXAPPCHATID.trim()
        }
      }
    );

    const result = await upstream.json();

    // 只返回二维码，不把其他上游信息暴露出去
    if (
      result.status !== 0 ||
      !result.data?.qr
    ) {
      return res.status(upstream.status || 502).json({
        status: result.status ?? upstream.status,
        message: result.message || "QR_REQUEST_FAILED"
      });
    }

    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://mahafujtakla-sys.github.io"
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return res.status(200).json({
      status: 0,
      qr: result.data.qr
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message || "SERVER_ERROR"
    });
  }
}
