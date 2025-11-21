import { Button } from "@/ui/components/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-default-background px-6 py-24">
        <div className="flex max-w-[500px] flex-col items-center gap-4 text-center">
          <span className="text-[72px] font-bold text-neutral-400">404</span>
          <div className="flex flex-col gap-2">
            <span className="text-heading-1 font-heading-1 text-default-font">
              List Not Found
            </span>
            <span className="text-body font-body text-subtext-color">
              This list doesn't exist or may have been removed by the author.
            </span>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <Link href="/create">
              <Button variant="neutral-secondary">Create a List</Button>
            </Link>
          </div>
        </div>
    </div>
  );
}

