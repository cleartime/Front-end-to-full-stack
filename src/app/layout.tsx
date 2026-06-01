import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "FullStack Transition Lab",
  description: "前端工程师转全栈的可运行训练项目"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
