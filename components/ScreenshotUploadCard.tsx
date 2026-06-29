"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Wifi } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui";

// 릴스 상세에서 폰으로 EDIT 스크린샷을 바로 올리도록 QR을 띄운다.
// 서버의 LAN 주소를 감지해 /upload?reelId=...로 인코딩.
export function ScreenshotUploadCard({ reelId }: { reelId: string }) {
  const [lanUrl, setLanUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/host")
      .then((r) => r.json())
      .then((d) => setLanUrl(d.lanUrl))
      .catch(() => setLanUrl(null));
  }, []);

  const uploadUrl = lanUrl ? `${lanUrl}/upload?reelId=${encodeURIComponent(reelId)}` : null;

  return (
    <Card>
      <CardHeader title="EDIT 스크린샷 업로드" icon={<QrCode size={16} className="text-brand-600" />} />
      <CardBody>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <div className="rounded-xl border border-border-subtle bg-white p-3">
            {uploadUrl ? (
              <QRCodeSVG value={uploadUrl} size={132} />
            ) : (
              <div className="flex h-[132px] w-[132px] items-center justify-center text-xs text-neutral-400">
                주소 감지 중…
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm text-neutral-600">
            <p>폰 카메라로 QR을 스캔하면 <b>이 릴스</b>의 업로드 화면이 열립니다. 사진을 올리면 3초 훅·잔존 곡선·유입 소스가 자동 파싱·저장돼요.</p>
            <p className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Wifi size={13} /> 폰과 PC가 같은 와이파이여야 합니다. (방화벽이 포트를 막으면 허용 필요)
            </p>
            {uploadUrl ? (
              <p className="break-all rounded-lg bg-surface-muted px-2 py-1 text-xs text-neutral-500">{uploadUrl}</p>
            ) : (
              <p className="text-xs text-band-weak">
                LAN 주소를 찾지 못했습니다. PC에서 직접 업로드하거나 같은 네트워크인지 확인하세요.
              </p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
