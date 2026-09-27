import { useEffect, useState } from "react";
import { ArrowRight, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../Components/StatCard";
import { getClients, getFamilies } from "../services/api";

export default function Dashboard() {
	const [clients, setClients] = useState([]);
	const [families, setFamilies] = useState([]);

	useEffect(() => {
		Promise.all([getClients(), getFamilies()]).then(([clientRecords, familyRecords]) => {
			setClients(clientRecords);
			setFamilies(familyRecords);
		});
	}, []);

	const activeClients = clients.filter((client) => client.status === "Active").length;
	const waitlistClients = clients.filter((client) => client.status === "Waitlist").length;
	const familyName = (id) => families.find((family) => family.id === id)?.primaryContactName || "No family assigned";

	return (
		<section>
			<div className="page-heading">
				<div><p className="eyebrow">Overview</p><h1>Good morning, Alex.</h1><p className="heading-copy">Here is a clear view of the families and clients in your care.</p></div>
				<Link className="primary-button" to="/clients"><UsersRound size={18} /> Add client</Link>
			</div>

			<div className="stats-grid">
				<StatCard label="Active clients" value={activeClients} detail="Currently receiving care" />
				<StatCard label="Families" value={families.length} detail="Primary contacts on file" tone="amber" />
				<StatCard label="Waitlist" value={waitlistClients} detail="Awaiting placement" tone="rose" />
			</div>

			<div className="content-panel dashboard-list">
				<div className="panel-heading"><div><p className="eyebrow">Client directory</p><h2>Recently added</h2></div><Link className="text-link" to="/clients">View all <ArrowRight size={16} /></Link></div>
				{clients.length ? <div className="simple-list">{clients.slice(0, 5).map((client) => <div className="client-row" key={client.id}><div className="client-initials">{`${client.firstName[0]}${client.lastName[0]}`}</div><div><strong>{client.firstName} {client.lastName}</strong><span>{familyName(client.familyId)}</span></div><span className={`status ${client.status.toLowerCase()}`}>{client.status}</span></div>)}</div> : <div className="empty-state">No client records yet.</div>}
			</div>
		</section>
	);
}
