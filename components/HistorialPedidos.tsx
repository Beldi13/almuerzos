"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { isAfter, parseISO } from "date-fns";

type Pedido = {
  id: number;
  fecha: string;
  tipo_pedido: string;
  extra: boolean;
  observacion: string;
};

type Menu = {
  fecha: string;
  sopa: string;
  opcion1: string;
  opcion2: string;
};

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [menus, setMenus] = useState<Map<string, Menu>>(new Map());
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");

  const fetchPedidos = async () => {
    if (!desde || !hasta) return;
    if (desde > hasta) {
      setPedidos([]);
      setMensaje("⚠️ Rango de fechas inválido");
      return;
    }

    setMensaje("");
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Pedidos del usuario
    const { data: pedidosData, error: pedidosError } = await supabase
      .from("pedidos")
      .select("*")
      .eq("usuario_id", user.id)
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha", { ascending: false });

    if (pedidosError || !pedidosData) {
      setPedidos([]);
      return;
    }

    setPedidos(pedidosData);

    // Fechas únicas de los pedidos
    const fechas = [...new Set(pedidosData.map((p) => p.fecha))];

    // Menús correspondientes
    const { data: menusData, error: menusError } = await supabase
      .from("menu")
      .select("fecha, sopa, opcion1, opcion2")
      .in("fecha", fechas);

    if (!menusError && menusData) {
      const menuMap = new Map<string, Menu>();
      menusData.forEach((m) => menuMap.set(m.fecha, m));
      setMenus(menuMap);
    }
  };

  const eliminarPedido = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este pedido?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (!error) {
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [desde, hasta]);

  const hoy = new Date();

  function describirPedido(pedido: Pedido, menu: Menu | undefined) {
    if (!menu) return pedido.tipo_pedido;
    switch (pedido.tipo_pedido) {
      case "sopa":
        return "Solo sopa";
      case "opcion1":
        return `Solo segundo: ${menu.opcion1}`;
      case "opcion2":
        return `Solo segundo: ${menu.opcion2}`;
      case "completo1":
        return `Completo Opción 1 (${menu.sopa} + ${menu.opcion1})`;
      case "completo2":
        return `Completo Opción 2 (${menu.sopa} + ${menu.opcion2})`;
      default:
        return pedido.tipo_pedido;
    }
  }

  return (
    <div className="flex flex-col h-auto lg:h-[80vh]">
      <h2 className="text-xl font-bold mb-4">📆 Historial de pedidos</h2>

      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block font-medium">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border w-auto rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block font-medium">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border w-auto rounded px-2 py-1"
          />
        </div>
      </div>

      {mensaje && <p className="text-yellow-600 mb-4">{mensaje}</p>}
      {pedidos.length === 0 && !mensaje && (
        <p className="text-gray-400">No hay pedidos en el rango seleccionado.</p>
      )}

      <div className="overflow-y-auto flex-1 pr-1">
        <ul className="space-y-4">
          {pedidos.map((p) => {
            const puedeEliminar = isAfter(parseISO(p.fecha), hoy);
            const menu = menus.get(p.fecha);
            return (
              <li key={p.id} className="border rounded p-4 shadow-sm dark:bg-gray-900 relative">
                <p><strong>Fecha:</strong> {p.fecha}</p>
                <p><strong>Pedido:</strong> {describirPedido(p, menu)}</p>
                {p.extra && <p><strong>Porción extra:</strong> Sí</p>}
                {p.observacion && <p><strong>Observación:</strong> {p.observacion}</p>}

                {puedeEliminar && (
                  <button
                    onClick={() => eliminarPedido(p.id)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    title="Eliminar pedido"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
