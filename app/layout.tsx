import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "do it; - Todo List",
  description: "코드잇 단기심화 지원자 과제 Todo List 웹 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
