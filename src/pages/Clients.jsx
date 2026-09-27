import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import ClientFormModal from "../Components/ClientFormModal";
import { deleteClient, getClients, getFamilies } from "../services/api";

export default function Clients() {
	const [clients, setClients] = useState([]);
	const [families, setFamilies] = useState([]);
	const [search, setSearch] = useState("");
	const [selectedClient, setSelectedClient] = useState(null);
	const [isFormOpen, setIsFormOpen] = useState(false);

	const refresh = async () => {
		const [clientRecords, familyRecords] = await Promise.all([getClients(), getFamilies()]);
		setClients(clientRecords);
		setFamilies(familyRecords);
	};

	useEffect(() => {
		Promise.all([getClients(), getFamilies()]).then(([clientRecords, familyRecords]) => {
			setClients(clientRecords);
			setFamilies(familyRecords);
		});
	}, []);
	const familyName = (id) => families.find((family) => family.id === id)?.primaryContactName || "Unassigned";
	const displayedClients = clients.filter((client) => `${client.firstName} ${client.lastName}`.toLowerCase().includes(search.toLowerCase()));

	const handleDelete = async (id) => {
		if (window.confirm("Remove this client record?")) { await deleteClient(id); refresh(); }
	};
	const openCreate = () => { setSelectedClient(null); setIsFormOpen(true); };
	const openEdit = (client) => { setSelectedClient(client); setIsFormOpen(true); };

	return <section>
		<div className="page-heading"><div><p className="eyebrow">Records</p><h1>Clients</h1><p className="heading-copy">Manage client records and their family connections.</p></div><button className="primary-button" type="button" onClick={openCreate}><Plus size={18} /> Add client</button></div>
		<div className="content-panel">
			<div className="toolbar"><label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients" /></label><span className="record-count">{displayedClients.length} records</span></div>
			{displayedClients.length ? <div className="table-wrap"><table><thead><tr><th>Client</th><th>Family</th><th>Status</th><th>Notes</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{displayedClients.map((client) => <tr key={client.id}><td><div className="table-client"><span className="client-initials small">{client.firstName[0]}{client.lastName[0]}</span><strong>{client.firstName} {client.lastName}</strong></div></td><td>{familyName(client.familyId)}</td><td><span className={`status ${client.status.toLowerCase()}`}>{client.status}</span></td><td className="notes-cell">{client.notes || "-"}</td><td><div className="row-actions"><button type="button" className="icon-button" onClick={() => openEdit(client)} aria-label={`Edit ${client.firstName} ${client.lastName}`} title="Edit client"><Pencil size={17} /></button><button type="button" className="icon-button danger" onClick={() => handleDelete(client.id)} aria-label={`Delete ${client.firstName} ${client.lastName}`} title="Delete client"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div> : <div className="empty-state">No clients match your search.</div>}
		</div>
		{isFormOpen && <ClientFormModal client={selectedClient} families={families} onClose={() => { setIsFormOpen(false); refresh(); }} />}
	</section>;
}
