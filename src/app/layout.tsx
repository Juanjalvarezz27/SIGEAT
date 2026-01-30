import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import 'react-toastify/dist/ReactToastify.css'
import "./globals.css";
import Navbar from "@/src/app/components/Navbar";
import { AuthProvider } from "@/src/app/providers/AuthProvider";
import { ToastContainer } from 'react-toastify'

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: "300",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "SEGEAT - Autolavado",
  description: "Gestión de Vehículos en Autolavado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-[#e2e2f6] text-[#140f07] antialiased selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
            {children}
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </body>
    </html>
  );
}