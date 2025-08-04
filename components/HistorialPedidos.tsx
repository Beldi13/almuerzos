"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

type Pedido = {
  id: number;
  fecha: string;
  tipo_pedido: string;
  extra: boolean;
  observacion: string;
};

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
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

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("usuario_id", user.id)
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha", { ascending: false });

    if (!error && data) {
      setPedidos(data);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [desde, hasta]);

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
            className="border w-auto rounded px-2 py-1 "
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
          {pedidos.map((p) => (
            <li key={p.id} className="border rounded p-4 shadow-sm  dark:bg-gray-900">
              <p>
                <strong>Fecha:</strong> {p.fecha}
              </p>
              <p>
                <strong>Tipo:</strong> {p.tipo_pedido}
              </p>
              {p.extra && (
                <p>
                  <strong>Porción extra:</strong> Sí
                </p>
              )}
              {p.observacion && (
                <p>
                  <strong>Observación:</strong> {p.observacion}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
