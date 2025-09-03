"use client"

import { useAuth } from "./use-auth"

export function usePermissions() {
  const { isKeyur, isAuthenticated } = useAuth()

  return {
    isAdmin: isKeyur,
    canCreate: isKeyur,
    canRead: isAuthenticated, // All authenticated users can read
    canUpdate: isKeyur,
    canDelete: isKeyur,
    canView: isAuthenticated, // All authenticated users can view
    permissions: isKeyur ? ["admin", "create", "read", "update", "delete", "view"] : ["read", "view"],
  }
}
