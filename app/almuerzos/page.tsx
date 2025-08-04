"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FechaSelector from "@/components/FechaSelector";
import HistorialPedidos from "@/components/HistorialPedidos";
import Navbar from "@/components/NavBar";
import { useRouter } from "next/navigation";

type Menu = {
  fecha: string;
  sopa: string;
  opcion1: string;
  opcion2: string;
};


export default function Home() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);
  const [pedido, setPedido] = useState("");
  const [extra, setExtra] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [observacion, setObservacion] = useState("");

  const supabase = createClient();

  const router = useRouter();


  useEffect(() => {
  const verificarSesion = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
    }
  };

  verificarSesion();
}, []);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!fechaSeleccionada) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("menu")
        .select("*")
        .eq("fecha", fechaSeleccionada)
        .single();

      setMenu(error ? null : data);
      setLoading(false);
    };

    fetchMenu();
  }, [fechaSeleccionada]);

  const handlePedido = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setMensaje("Debes iniciar sesión");
      return;
    }

    if (!pedido) {
      setMensaje("Selecciona una opción");
      return;
    }

    const { error } = await supabase.from("pedidos").insert({
      usuario_id: user.id,
      fecha: menu?.fecha,
      tipo_pedido: pedido,
      extra,
      observacion,
    });

    setMensaje(error ? "Error al registrar pedido: " + error.message : "✅ Pedido registrado");
    if (!error) {
      setPedido("");
      setExtra(false);
      setObservacion("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="col-span-4 lg:col-span-4">
        <Navbar />
      </div>

      {/* Main Grid */}
      <main className="flex flex-col lg:flex-row flex-1 p-4 gap-4 bg-gray-100 dark:bg-gray-800">
        {/* Columna Izquierda: Calendario + Menú */}
        <div className="flex flex-col gap-4 w-full lg:w-1/4">
          <section className="bg-white dark:bg-gray-900 shadow rounded p-4 flex-1 text-gray-800 dark:text-white">
            <h2 className="font-semibold mb-2">Calendario</h2>
            <FechaSelector onDateChange={setFechaSeleccionada} />
          </section>
          <section className="bg-white dark:bg-gray-900 shadow rounded p-4 flex-1 text-gray-800 dark:text-white">
            <h2 className="font-semibold mb-2 ">Menú de comida</h2>
            {loading ? (
              <p className="">Cargando menú...</p>
            ) : !menu ? (
              <p className="">No hay menú cargado para esta fecha.</p>
            ) : (
              <div className="space-y-2 ">
                <p>
                  <strong>Fecha:</strong> {menu.fecha}
                </p>
                <p>
                  <strong>Sopa:</strong> {menu.sopa}
                </p>
                <p>
                  <strong>Opción 1:</strong> {menu.opcion1}
                </p>
                <p>
                  <strong>Opción 2:</strong> {menu.opcion2}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Columna Centro: Formulario */}
        <div className="bg-white dark:bg-gray-900 shadow rounded p-4 w-full lg:w-2/4  dark:text-white">
          <h2 className="font-semibold mb-4">Formulario</h2>
          {menu && (
            <div className="space-y-4 ">
              <div className="space-y-2">
                {["sopa", "opcion1", "opcion2", "completo1", "completo2"].map((op) => (
                  <label key={op} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pedido"
                      value={op}
                      checked={pedido === op}
                      onChange={() => setPedido(op)}
                    />
                    {op === "completo1" && `Completo Opción 1 (sopa + ${menu.opcion1})`}
                    {op === "completo2" && `Completo Opción 2 (sopa + ${menu.opcion2})`}
                    {op === "opcion1" && `Solo segundo: ${menu.opcion1}`}
                    {op === "opcion2" && `Solo segundo: ${menu.opcion2}`}
                    {op === "sopa" && `Solo sopa`}
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={extra}
                  onChange={(e) => setExtra(e.target.checked)}
                />
                Quiero porción extra
              </label>

              <div>
                <label className="block font-medium mb-1">Observación (opcional)</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  placeholder="Ej: Sin cebolla, para llevar en tarrina..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                />
              </div>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handlePedido}
              >
                Registrar pedido
              </button>

              {mensaje && <p className="mt-2 text-sm text-green-600 font-medium">{mensaje}</p>}
            </div>
          )}
        </div>

        {/* Columna Derecha: Historial */}
        <div className="bg-white dark:bg-gray-900 shadow rounded p-4 w-full lg:w-1/4 text-gray-900 dark:text-white h-auto lg:max-h-[100vh]">
          {" "}
          <h2 className="font-semibold mb-2">Historial de pedidos</h2>
          <HistorialPedidos />
        </div>
      </main>
    </div>
  );
}
