import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QUẢN TRỊ TỊCH VĂN",
  description: "TỊCH VĂN SHOW",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={font.className} suppressHydrationWarning={true}>
        <ToastProvider>
          <div className="flex">{children}</div>
        </ToastProvider>
        <Toaster />
      </body>
    </html>
  );
}
