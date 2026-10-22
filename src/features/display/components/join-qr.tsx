"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

/** Base do QR: NEXT_PUBLIC_APP_URL se definida, senão a origem atual. O QR aponta para o mural. */
const muralUrl = (base: string) => `${base.replace(/\/+$/, "")}/mural`;

/** QR para a página do participante. */
export function JoinQr() {
  const [url, setUrl] = useState<string | null>(
    process.env.NEXT_PUBLIC_APP_URL ? muralUrl(process.env.NEXT_PUBLIC_APP_URL) : null,
  );

  // window só existe no cliente; resolver no efeito evita divergência com o HTML do servidor.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_APP_URL) setUrl(muralUrl(window.location.origin));
  }, []);

  return (
    <div className="flex flex-col items-center gap-[1.5vh]">
      <div className="aspect-square w-full max-w-[38vh] rounded-[2vh] bg-white p-[2vh]">
        {url ? (
          <QRCodeSVG value={url} level="M" marginSize={0} className="h-full w-full" title="QR code para participar" />
        ) : (
          <div className="h-full w-full animate-pulse rounded bg-neutral-200" />
        )}
      </div>
      <p className="text-[2.4vh] font-medium text-muted">{url ? url.replace(/^https?:\/\//, "") : " "}</p>
    </div>
  );
}
