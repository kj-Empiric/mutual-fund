import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Contributions" text="Track contributions to mutual funds." />

      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
