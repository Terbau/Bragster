import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SmartReceiptPage() {
  return (
    <div>
      <Button asChild>
        <Link href="/smart-receipt/new">Create new</Link>
      </Button>
    </div>
  );
}
