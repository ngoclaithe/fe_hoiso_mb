"use client";
import { useEffect, useState } from "react";

// Define interface for User object
interface User {
  id: string;
  username?: string;
  email?: string;
  role: string;
}

// Define interface for API response
interface UsersApiResponse {
  data?: User[];
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/users'); }, [router]);
  return null;
}
