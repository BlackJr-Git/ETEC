import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Entre Terre et Ciel | Nécropole", description: "Un accompagnement humain pour les familles à Kinshasa, Lubumbashi et depuis l'étranger.", icons:{icon:"/favicon.svg"} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
