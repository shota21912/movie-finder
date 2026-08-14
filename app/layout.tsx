import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

// app/layout.tsx はNext.jsのApp Routerで必ず必要な特別なファイル。
// 「全ページ共通の外枠(<html>や<body>タグ、ヘッダーなど)」をここに書く。
// 各ページ(app/page.tsxやapp/mood/page.tsxなど)の中身は、
// 下の {children} の部分に自動的に差し込まれる。

// next/font/google は、Googleフォントをビルド時にダウンロードして
// 自分のサーバーから配信できるようにするNext.js専用の仕組み。
// 外部のフォントサーバーに直接リクエストするより表示が速く、プライバシー的にも安全。
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// metadataはブラウザのタブに表示されるタイトルや、SNSでシェアされた時の説明文などに使われる。
// Next.jsがこのオブジェクトを見つけて、自動的に<head>タグの中身を生成してくれる。
export const metadata: Metadata = {
  title: "Movie Finder",
  description: "気分やサブスクから見たい映画を見つけよう",
};

// RootLayoutという名前・この場所(app/layout.tsx)であることに意味がある特別なコンポーネント。
// childrenには、今開いているページの中身(例: app/mood/page.tsxの返り値)が自動的に渡ってくる。
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        {/* Headerは全ページ共通で表示したいので、childrenの外側(layoutの中)に置いている */}
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
