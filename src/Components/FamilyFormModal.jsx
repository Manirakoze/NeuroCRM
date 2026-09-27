import { useState } from "react";
import { X } from "lucide-react";
import { createFamily, updateFamily } from "../services/api";

export default function FamilyFormModal({ family, onClose }) {
  const [form, setForm] = useState({
    primaryContactName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (family) await updateFamily(family.id, form);
    else await createFamily(form);

    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation"><div className="modal modal-compact" role="dialog" aria-modal="true" aria-labelledby="family-form-title"><div className="modal-heading"><div><p className="eyebrow">Family contact</p><h2 id="family-form-title">{family ? "Edit family" : "Add family"}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div><form onSubmit={handleSubmit}><div className="form-grid"><label className="full-width">Primary contact<input name="primaryContactName" value={form.primaryContactName} onChange={handleChange} required /></label><label>Email<input type="email" name="email" value={form.email} onChange={handleChange} /></label><label>Phone<input name="phone" value={form.phone} onChange={handleChange} /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">Save family</button></div></form></div></div>
  );
}