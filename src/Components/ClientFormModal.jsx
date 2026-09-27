import { useState } from "react";
import { X } from "lucide-react";
import { createClient, updateClient } from "../services/api";

const blankClient = { firstName: "", lastName: "", dateOfBirth: "", status: "Active", familyId: "", notes: "" };

export default function ClientFormModal({ client, families, onClose }) {
	const [form, setForm] = useState(client || blankClient);
	const [saving, setSaving] = useState(false);
	const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });
	const submit = async (event) => { event.preventDefault(); setSaving(true); if (client) await updateClient(client.id, form); else await createClient(form); onClose(); };

	return <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="client-form-title"><div className="modal-heading"><div><p className="eyebrow">Client record</p><h2 id="client-form-title">{client ? "Edit client" : "Add client"}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div><form onSubmit={submit}><div className="form-grid"><label>First name<input name="firstName" value={form.firstName} onChange={updateField} required /></label><label>Last name<input name="lastName" value={form.lastName} onChange={updateField} required /></label><label>Date of birth<input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={updateField} /></label><label>Status<select name="status" value={form.status} onChange={updateField}><option>Active</option><option>Waitlist</option><option>Inactive</option></select></label><label className="full-width">Family<select name="familyId" value={form.familyId} onChange={updateField}><option value="">No family assigned</option>{families.map((family) => <option key={family.id} value={family.id}>{family.primaryContactName}</option>)}</select></label><label className="full-width">Care notes<textarea name="notes" value={form.notes} onChange={updateField} rows="3" placeholder="Optional notes for this client" /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save client"}</button></div></form></div></div>;
}
