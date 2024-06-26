import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./_components/Provider";
import MyNavbar from "./_components/MyNavbar";
import { Suspense } from "react";
import {Spinner} from "@nextui-org/react";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stark Randomizer",
  description: " A well designed Randomizer for StarkNet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={inter.className}>
          <Providers>
            <Suspense fallback={<Spinner />}>
            <MyNavbar />
            </Suspense>
            <main className="flex min-h-screen flex-col items-center justify-between p-10 dark">
              {children}
            </main>
          </Providers>
        </body>
    </html>
  );
}
