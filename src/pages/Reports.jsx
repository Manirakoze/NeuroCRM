import { useEffect, useState } from "react";
import { FileText, Plus, Printer, Trash2 } from "lucide-react";
import { createReport, deleteReport, getClients, getFamilies, getReports } from "../services/api";

const blankEntry = () => ({ date: "", startTime: "", endTime: "" });
const blankReport = () => ({ clientId: "", fromDate: "", toDate: "", hourlyRate: "", parentName: "", parentEmail: "", parentPhone: "", parentAddress: "", financialManager: "", claimReference: "", notes: "", entries: Array.from({ length: 7 }, blankEntry) });

function hoursBetween(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return Math.max(0, (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60);
}

function formatHours(hours) {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(2);
}

export default function Reports() {
  const [clients, setClients] = useState([]);
  const [families, setFamilies] = useState([]);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState(blankReport);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const refresh = async () => {
    const [clientRecords, familyRecords, reportRecords] = await Promise.all([getClients(), getFamilies(), getReports()]);
    setClients(clientRecords);
    setFamilies(familyRecords);
    setReports(reportRecords);
  };

  useEffect(() => {
    Promise.all([getClients(), getFamilies(), getReports()]).then(([clientRecords, familyRecords, reportRecords]) => {
      setClients(clientRecords);
      setFamilies(familyRecords);
      setReports(reportRecords);
    });
  }, []);

  const client = clients.find((record) => record.id === form.clientId);
  const totalHours = form.entries.reduce((total, entry) => total + hoursBetween(entry.startTime, entry.endTime), 0);
  const totalAmount = totalHours * (Number(form.hourlyRate) || 0);

  const startReport = () => {
    const report = blankReport();
    setForm(report);
    setSelectedReport(null);
    setIsCreating(true);
  };

  const selectClient = (event) => {
    const selectedClient = clients.find((record) => record.id === event.target.value);
    const selectedFamily = families.find((record) => record.id === selectedClient?.familyId);
    setForm({ ...form, clientId: event.target.value, parentName: selectedFamily?.primaryContactName || "", parentEmail: selectedFamily?.email || "", parentPhone: selectedFamily?.phone || "" });
  };

  const updateEntry = (index, field, value) => {
    const entries = form.entries.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry);
    setForm({ ...form, entries });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const report = await createReport({ ...form, totalHours, totalAmount, childName: client ? `${client.firstName} ${client.lastName}` : "" });
    setSaving(false);
    setIsCreating(false);
    setSelectedReport(report);
    refresh();
  };

  const printReport = (report) => {
    setSelectedReport(report);
    window.setTimeout(() => window.print(), 0);
  };

  const removeReport = async (id) => {
    if (window.confirm("Delete this saved reimbursement report?")) { await deleteReport(id); refresh(); if (selectedReport?.id === id) setSelectedReport(null); }
  };

  if (isCreating) return <section className="report-page">
    <div className="page-heading"><div><p className="eyebrow">FCD reimbursement</p><h1>New service hours report</h1><p className="heading-copy">Service totals are calculated automatically from the daily record.</p></div><button className="secondary-button" type="button" onClick={() => setIsCreating(false)}>Cancel</button></div>
    <form onSubmit={submit} className="report-form">
      <section className="report-section"><h2>1. Parent / guardian information</h2><div className="form-grid"><label>Full name<input value={form.parentName} onChange={(event) => setForm({ ...form, parentName: event.target.value })} required /></label><label>Email address<input type="email" value={form.parentEmail} onChange={(event) => setForm({ ...form, parentEmail: event.target.value })} /></label><label>Telephone<input value={form.parentPhone} onChange={(event) => setForm({ ...form, parentPhone: event.target.value })} /></label><label>Address<input value={form.parentAddress} onChange={(event) => setForm({ ...form, parentAddress: event.target.value })} /></label></div></section>
      <section className="report-section"><h2>2. Child information</h2><div className="form-grid"><label>Child<select value={form.clientId} onChange={selectClient} required><option value="">Select a client</option>{clients.map((record) => <option key={record.id} value={record.id}>{record.firstName} {record.lastName}</option>)}</select></label><label>Reporting period<div className="date-range"><input type="date" value={form.fromDate} onChange={(event) => setForm({ ...form, fromDate: event.target.value })} required /><span>to</span><input type="date" value={form.toDate} onChange={(event) => setForm({ ...form, toDate: event.target.value })} required /></div></label></div></section>
      <section className="report-section"><h2>3. Daily service record</h2><div className="table-wrap"><table className="service-table"><thead><tr><th>Date</th><th>Service start time</th><th>Service end time</th><th>Total hours</th></tr></thead><tbody>{form.entries.map((entry, index) => <tr key={index}><td><input type="date" value={entry.date} onChange={(event) => updateEntry(index, "date", event.target.value)} /></td><td><input type="time" value={entry.startTime} onChange={(event) => updateEntry(index, "startTime", event.target.value)} /></td><td><input type="time" value={entry.endTime} onChange={(event) => updateEntry(index, "endTime", event.target.value)} /></td><td>{formatHours(hoursBetween(entry.startTime, entry.endTime))}</td></tr>)}</tbody></table></div><div className="report-totals"><label>Hourly rate<input type="number" min="0" step="0.01" value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })} placeholder="0.00" required /></label><div><span>Total hours</span><strong>{formatHours(totalHours)} hours</strong></div><div><span>Total amount</span><strong>${totalAmount.toFixed(2)}</strong></div></div></section>
      <section className="report-section"><h2>4. Centre verification</h2><div className="form-grid"><label>Financial manager full name<input value={form.financialManager} onChange={(event) => setForm({ ...form, financialManager: event.target.value })} /></label><label>Claim / reference number<input value={form.claimReference} onChange={(event) => setForm({ ...form, claimReference: event.target.value })} /></label><label className="full-width">Administrative notes<textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label></div></section>
      <div className="form-actions"><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save reimbursement report"}</button></div>
    </form>
  </section>;

  return <section className="report-page">
    <div className="page-heading"><div><p className="eyebrow">FCD reimbursement</p><h1>Service hours reports</h1><p className="heading-copy">Create verified records for reimbursement or refund claims.</p></div><button className="primary-button" type="button" onClick={startReport}><Plus size={18} /> New report</button></div>
    <div className="content-panel">{reports.length ? <div className="table-wrap"><table><thead><tr><th>Child</th><th>Reporting period</th><th>Hours</th><th>Amount</th><th>Claim reference</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}><td><strong>{report.childName}</strong></td><td>{report.fromDate} to {report.toDate}</td><td>{formatHours(report.totalHours)} hours</td><td>${Number(report.totalAmount).toFixed(2)}</td><td>{report.claimReference || "-"}</td><td><div className="row-actions"><button className="icon-button" type="button" onClick={() => printReport(report)} aria-label={`Print report for ${report.childName}`} title="Print report"><Printer size={17} /></button><button className="icon-button danger" type="button" onClick={() => removeReport(report.id)} aria-label={`Delete report for ${report.childName}`} title="Delete report"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div> : <div className="empty-state"><FileText size={30} /><p>No reimbursement reports have been created.</p><button className="primary-button" type="button" onClick={startReport}><Plus size={18} /> Create first report</button></div>}</div>
    {selectedReport && <PrintableReport report={selectedReport} />}
  </section>;
}

function PrintableReport({ report }) {
  return <article className="print-report" aria-hidden="true"><header><h1>Centre Neurodifferent Recipient Service</h1><h2>Service Hours & Reimbursement Report</h2><p>Purpose: This report documents services provided and hours worked in support of an FCD reimbursement or refund claim.</p></header><section><h3>1. Parent / Guardian Information</h3><p><b>Full Name:</b> {report.parentName}</p><p><b>Email:</b> {report.parentEmail} &nbsp; <b>Telephone:</b> {report.parentPhone}</p><p><b>Address:</b> {report.parentAddress}</p></section><section><h3>2. Child Information</h3><p><b>Child's Full Name:</b> {report.childName}</p><p><b>Reporting Period:</b> From {report.fromDate} To {report.toDate}</p></section><section><h3>3. Daily Service Record</h3><table><thead><tr><th>Date</th><th>Service Start Time</th><th>Service End Time</th><th>Total Hours</th></tr></thead><tbody>{report.entries.filter((entry) => entry.date || entry.startTime || entry.endTime).map((entry, index) => <tr key={index}><td>{entry.date}</td><td>{entry.startTime}</td><td>{entry.endTime}</td><td>{formatHours(hoursBetween(entry.startTime, entry.endTime))}</td></tr>)}</tbody></table><p><b>Total Number of Hours:</b> {formatHours(report.totalHours)} hours</p><p><b>Hourly Rate:</b> ${Number(report.hourlyRate).toFixed(2)} / hour</p><p><b>Total Amount:</b> ${Number(report.totalAmount).toFixed(2)}</p></section><section><h3>4. Parent / Guardian Confirmation</h3><p>I confirm that this report accurately reflects the service hours received by my child during the reporting period indicated above.</p><p><b>Parent/Guardian Full Name:</b> {report.parentName}</p><p className="signature-line">Signature: _________________________________ Date: _______________</p></section><section><h3>5. Centre Neurodifferent Recipient Service Verification</h3><p>I confirm that the service hours and amount reported above have been reviewed and are consistent with service records maintained by Centre Neurodifferent Recipient Service.</p><p><b>Financial Manager:</b> {report.financialManager || "________________"}</p><p><b>Position:</b> Financial Manager</p><p className="signature-line">Signature: _________________________________ Date: _______________</p></section><section><h3>6. For Administrative / FCD Use</h3><p><b>Claim/Reference Number:</b> {report.claimReference || "________________"}</p><p><b>Total Hours Claimed:</b> {formatHours(report.totalHours)} hours &nbsp; <b>Total Amount Claimed:</b> ${Number(report.totalAmount).toFixed(2)}</p><p><b>Notes:</b> {report.notes || "________________"}</p></section></article>;
}