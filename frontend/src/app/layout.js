import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/HOC/StoreProvider";
import ThemeProvider from "@/components/HOC/ThemeProvider";
import MySidebar from "@/components/root/MySidebar";
import { SocketProvider } from "@/components/HOC/SocketProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/root/Header";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Peer Connect",
    description: "Peer connect is platform for peer to peer interaction for doctors and patients .",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <ClerkProvider>
                <StoreProvider>
                    <body className={inter.className}>
                        <ThemeProvider>
                            <SocketProvider>
                                <div className="flex h-screen overflow-x-hidden bg-gray-50">
                                    <MySidebar />
                                    <div className="flex-1 overflow-auto">
                                        <Header />
                                        {children}
                                    </div>
                                </div>
                            </SocketProvider>
                        </ThemeProvider>
                    </body>
                </StoreProvider>
            </ClerkProvider>
        </html>
    );
}
