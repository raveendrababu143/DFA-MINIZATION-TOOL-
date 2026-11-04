import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
export const metadata: Metadata = { title:"DFA Minimization Tool | AutomataLab", description:"Interactive DFA builder, visualizer, minimizer and string simulator." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><div className="min-h-screen bg-[#080d1b] text-white"><Navbar/><div className="flex min-h-[calc(100vh-68px)]"><Sidebar/><main className="min-w-0 flex-1 p-4 md:p-8">{children}</main></div></div></body></html>}
