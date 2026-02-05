import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TCG One Piece API",
  description: "API for managing trading card game data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
