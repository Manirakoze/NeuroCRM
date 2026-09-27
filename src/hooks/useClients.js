import { useEffect, useState } from "react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../services/api";

export default function useClients() {
  const [clients, setClients] = useState([]);

  const fetchClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  useEffect(() => {
    void getClients().then(setClients);
  }, []);

  return {
    clients,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}