"use client";

import { useState, useEffect } from "react";
import { getAgenda, addShow, deleteShow } from "@/lib/agendaService";

export default function DashboardAgenda() {
  const [agenda, setAgenda] = useState([]);
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");

  const fetchAgenda = async () => {
    const shows = await getAgenda();
    setAgenda(shows);
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  const handleAddShow = async () => {
    if (!local || !data || !descricao) return;
    await addShow({ local, data: new Date(data), descricao });
    setLocal(""); setData(""); setDescricao("");
    fetchAgenda();
  };

  const handleDelete = async (id) => {
    await deleteShow(id);
    fetchAgenda();
  };

  return (
    <div className="dashboard-agenda">
      <h2>Painel Agenda</h2>
      <div className="form-show">
        <input placeholder="Local" value={local} onChange={(e) => setLocal(e.target.value)} />
        <input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} />
        <input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <button onClick={handleAddShow}>Adicionar Show</button>
      </div>
      <ul>
        {agenda.map(show => (
          <li key={show.id}>
            {show.local} - {new Date(show.data.seconds * 1000).toLocaleString()} - {show.descricao}
            <button onClick={() => handleDelete(show.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
