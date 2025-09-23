import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import Providers from "./providers";
import { getSession } from "@/lib/auth";
import { Toaster } from "./Toaster";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Bragster",
  description: "Bragster is a all-in-one platform for Brage's everyday needs.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = session?.user;

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="min-h-screen flex flex-col items-center">
              <Navbar user={user} />
              <div className="flex flex-col gap-20 max-w-5xl py-5 px-3 sm:p-5 grow">
                {children}
              </div>
              <Footer />
            </main>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
