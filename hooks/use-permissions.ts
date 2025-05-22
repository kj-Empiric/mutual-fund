// Create this file at hooks/use-permissions.ts
import { useSession } from "next-auth/react";

export function usePermissions() {
  const { data: session } = useSession();
  const permissions = (session?.user as any)?.role?.permissions || [];

  return {
    isAdmin: permissions.includes("admin"),
    canCreate: permissions.includes("create") || permissions.includes("admin"),
    canRead: permissions.includes("read") || permissions.includes("admin"),
    canUpdate: permissions.includes("update") || permissions.includes("admin"),
    canDelete: permissions.includes("delete") || permissions.includes("admin"),
    canView: permissions.includes("view") || permissions.includes("admin"),
    permissions,
  };
}
