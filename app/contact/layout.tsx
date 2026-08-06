import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell me about your project — one call is all it takes to figure out if we're a good fit.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
