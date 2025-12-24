"use client";

import { useState } from "react";
import { MoreHorizontal, Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function UserActions({ userId, currentRole, isBanned }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === "promote") {
        await authClient.admin.setRole({ userId, role: "admin" });
      } else if (action === "demote") {
        await authClient.admin.setRole({ userId, role: "user" });
      } else if (action === "ban") {
        await authClient.admin.banUser({ userId });
      } else if (action === "unban") {
        await authClient.admin.unbanUser({ userId });
      }
      
      router.refresh();
    } catch (error) {
      console.error("Action failed:", error);
      alert("Action failed: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          disabled={loading}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {currentRole !== "admin" && (
          <DropdownMenuItem
            onClick={() => handleAction("promote")}
            disabled={loading}
          >
            <Shield className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Promote to Admin
          </DropdownMenuItem>
        )}
        
        {currentRole === "admin" && (
          <DropdownMenuItem
            onClick={() => handleAction("demote")}
            disabled={loading}
          >
            <ShieldOff className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
            Demote to User
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {!isBanned ? (
          <DropdownMenuItem
            onClick={() => handleAction("ban")}
            disabled={loading}
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <Ban className="w-4 h-4 mr-2" />
            Ban User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleAction("unban")}
            disabled={loading}
            className="text-green-600 focus:text-green-600 dark:text-green-400 dark:focus:text-green-400"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Unban User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
