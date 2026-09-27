import { useEffect, useState } from "react";
import { Copy, Link2, Plus } from "lucide-react";
import { createEnrollmentLink, getEnrollmentLinks, getEnrollments } from "../services/api";

export default function Enrollments() {
  const [links, setLinks] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [program, setProgram] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => { const [linkRecords, enrollmentRecords] = await Promise.all([getEnrollmentLinks(), getEnrollments()]); setLinks(linkRecords); setEnrollments(enrollmentRecords); };
  useEffect(() => {
    Promise.all([getEnrollmentLinks(), getEnrollments()]).then(([linkRecords, enrollmentRecords]) => {
      setLinks(linkRecords);
      setEnrollments(enrollmentRecords);
    });
  }, []);
  const createLink = async (event) => { event.preventDefault(); if (!program.trim()) return; await createEnrollmentLink(program); setProgram(""); refresh(); };
  const copyLink = async (id) => { await navigator.clipboard.writeText(`${window.location.origin}/enroll/${id}`); setNotice("Enrollment link copied."); window.setTimeout(() => setNotice(""), 2500); };

  return <section><div className="page-heading"><div><p className="eyebrow">Intake</p><h1>Enrollment links</h1><p className="heading-copy">Create a program link to share by email with prospective families.</p></div></div><div className="enrollment-layout"><section className="content-panel enrollment-create"><div><p className="eyebrow">New invitation</p><h2>Create enrollment link</h2></div><form onSubmit={createLink}><label>Program name<input value={program} onChange={(event) => setProgram(event.target.value)} placeholder="e.g. Social skills group" required /></label><button className="primary-button"><Plus size={18} /> Create link</button></form>{notice && <p className="copy-notice">{notice}</p>}</section><section className="content-panel"><div className="panel-heading"><div><p className="eyebrow">Published links</p><h2>Ready to share</h2></div></div>{links.map((link) => <div className="enrollment-link-row" key={link.id}><div><strong>{link.program}</strong><span>/enroll/{link.id}</span></div><button type="button" className="secondary-button" onClick={() => copyLink(link.id)}><Copy size={16} /> Copy</button></div>)}</section></div><section className="content-panel enrollment-submissions"><div className="panel-heading"><div><p className="eyebrow">Incoming requests</p><h2>Submitted enrollments</h2></div><span className="record-count">{enrollments.length} submitted</span></div>{enrollments.length ? <div className="table-wrap"><table><thead><tr><th>Child</th><th>Parent / guardian</th><th>Program</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{enrollments.map((enrollment) => <tr key={enrollment.id}><td><strong>{enrollment.childName}</strong></td><td>{enrollment.parentName}<br /><span className="table-subtext">{enrollment.parentEmail}</span></td><td>{enrollment.program}</td><td>{new Date(enrollment.submittedAt).toLocaleDateString()}</td><td><span className="status waitlist">{enrollment.status}</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><Link2 size={30} /><p>Submitted enrollment requests will appear here.</p></div>}</section></section>;
}