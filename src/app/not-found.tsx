import { NotFoundClient } from "@/components/panel/not-found-client";

export default function NotFound() {
  return <NotFoundClient />;
}

export const metadata = {
  title: "ERR-404 · Signal not found",
  robots: { index: false, follow: true },
};
