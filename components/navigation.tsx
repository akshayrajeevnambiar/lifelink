"use client";

import Link from "next/link";
import { Search, UserPlus, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/search" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
              <Droplet className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              LifeLink
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Button
              variant={pathname === "/search" ? "default" : "ghost"}
              size="sm"
              asChild
              className="rounded-xl"
            >
              <Link href="/search" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </Link>
            </Button>

            <Button
              variant={pathname === "/donors/new" ? "default" : "ghost"}
              size="sm"
              asChild
              className="rounded-xl"
            >
              <Link href="/donors/new" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Donor</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
