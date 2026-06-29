import { NextResponse } from "next/server";
import { networkInterfaces } from "node:os";

// 폰이 접속 가능한 LAN 주소를 감지해 반환 (QR 인코딩용).
// localhost로는 폰에서 못 여니 실제 사설 IPv4를 찾는다.
function lanIPv4(): string | null {
  const nets = networkInterfaces();
  for (const addrs of Object.values(nets)) {
    for (const net of addrs ?? []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return null;
}

export async function GET(req: Request) {
  // Docker 등 외부에서 직접 서버 IP를 지정한 경우 우선 사용
  const envHost = process.env.LAN_HOST?.trim();
  if (envHost) {
    return NextResponse.json({ lanUrl: envHost });
  }

  const host = req.headers.get("host") ?? "";
  const port = host.includes(":") ? host.split(":")[1] : "3000";
  const ip = lanIPv4();
  const lanUrl = ip ? `http://${ip}:${port}` : null;
  return NextResponse.json({ lanUrl });
}
