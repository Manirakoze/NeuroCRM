import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import FamilyFormModal from "../Components/FamilyFormModal";
import { deleteFamily, getClients, getFamilies } from "../services/api";

export default function Families() {
  const [families, setFamilies] = useState([]);
  const [clients, setClients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [search, setSearch] = useState("");

  const fetchFamilies = async () => {
    const [familyRecords, clientRecords] = await Promise.all([getFamilies(), getClients()]);
    setFamilies(familyRecords);
    setClients(clientRecords);
  };

  useEffect(() => {
    Promise.all([getFamilies(), getClients()]).then(([familyRecords, clientRecords]) => {
      setFamilies(familyRecords);
      setClients(clientRecords);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this family? Associated clients will remain unassigned.")) return;
    await deleteFamily(id);
    fetchFamilies();
  };

  const handleEdit = (family) => {
    setSelectedFamily(family);
    setIsOpen(true);
  };

  const handleCreate = () => {
    setSelectedFamily(null);
    setIsOpen(true);
  };

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow">Contacts</p><h1>Families</h1><p className="heading-copy">Keep the primary contacts for each family up to date.</p></div><button onClick={handleCreate} className="primary-button" type="button"><Plus size={18} /> Add family</button></div>
      <div className="content-panel"><div className="toolbar"><label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search families" /></label><span className="record-count">{families.length} records</span></div><div className="table-wrap"><table><thead><tr><th>Primary contact</th><th>Email</th><th>Phone</th><th>Clients</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{families.filter((family) => family.primaryContactName.toLowerCase().includes(search.toLowerCase())).map((family) => <tr key={family.id}><td><strong>{family.primaryContactName}</strong></td><td>{family.email || "-"}</td><td>{family.phone || "-"}</td><td>{clients.filter((client) => client.familyId === family.id).length}</td><td><div className="row-actions"><button type="button" className="icon-button" onClick={() => handleEdit(family)} aria-label={`Edit ${family.primaryContactName}`} title="Edit family"><Pencil size={17} /></button><button type="button" className="icon-button danger" onClick={() => handleDelete(family.id)} aria-label={`Delete ${family.primaryContactName}`} title="Delete family"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div></div>

      {isOpen && (
        <FamilyFormModal
          family={selectedFamily}
          onClose={() => {
            setIsOpen(false);
            fetchFamilies();
          }}
        />
      )}
    </section>
  );
}