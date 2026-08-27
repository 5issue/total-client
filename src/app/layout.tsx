import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "total-client",
    template: "%s | total-client",
  },
  description: "통합 이커머스 프론트엔드",
  applicationName: "total-client",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 접근성: user-scalable=no / maximum-scale 로 확대를 막지 않는다.
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" dir="ltr">
      <body>
        {/* swUrl 은 반드시 src/app/serwist/[path]/route.ts 의 경로와 일치해야 한다. */}
        <SerwistProvider swUrl="/serwist/sw.js">
          <Providers>{children}</Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
