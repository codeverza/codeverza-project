import { Poppins } from "next/font/google";
import "./globals.css";
import OneSignalInit from "./components/OneSignalInit";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Codeverza",
  description: "Professional Software House Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins antialiased">
        <OneSignalInit />
        {children}
      </body>
    </html>
  );
}
