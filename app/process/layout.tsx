import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Process",
  description: "How I work — from the first conversation to a live, polished website. 4 steps: Brief, Design, Development, Launch.",
};

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
