import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Peer Connect",
    description: "Peer connect is platform for peer to peer interaction for doctors and patients .",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex h-screen overflow-x-hidden bg-gray-50">
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}
