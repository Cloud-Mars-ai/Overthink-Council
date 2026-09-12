import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "《内耗委员会 · Campus》——把大学生脑子里的纠结，真的开成一场会",
  description: "你每纠结一件事，AI 就让你脑子里的“GPA、睡眠、钱包、社交、恋爱、未来的你”坐下来当场互怼开会，输出可执行强制决议。",
  keywords: ["大学生", "内耗委员会", "多智能体", "黑客松", "AI决策", "荒诞政务"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full dark">
      <body className="min-h-full flex flex-col bg-[#07080d] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
