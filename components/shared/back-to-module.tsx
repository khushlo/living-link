import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToModule({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:underline">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
