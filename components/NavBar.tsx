"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        const name = profile?.display_name || user.email;
        setUsername(name);
      } else {
        setUsername(null);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
router.push("/auth/login"); 
  };

  return (
    <header className="w-full dark:bg-gray-900 text-black dark:text-white px-4 py-3 shadow-md flex flex-wrap justify-between items-center gap-2">
      {/* Logo o título */}
      <div className="text-lg font-bold whitespace-nowrap">🍽 Almuerzos</div>

      {/* Sección de usuario y botón */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="truncate max-w-[150px] sm:max-w-[250px] md:max-w-full">
          👤 {username ?? "Usuario"}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
