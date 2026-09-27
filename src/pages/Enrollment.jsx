import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { getEnrollmentLink, submitEnrollment } from "../services/api";

const blankForm = { parentName: "", parentEmail: "", parentPhone: "", childFirstName: "", childLastName: "", dateOfBirth: "", consent: false };

export default function Enrollment() {
  const { linkId } = useParams();
  const [link, setLink] = useState(undefined);
  const [form, setForm] = useState(blankForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { void getEnrollmentLink(linkId).then(setLink); }, [linkId]);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try { await submitEnrollment(linkId, form); setSubmitted(true); } catch (submissionError) { setError(submissionError.message); }
  };

  if (link === undefined) return <main className="public-page"><p>Loading enrollment form...</p></main>;
  if (!link) return <main className="public-page"><section className="public-card"><h1>This enrollment link is unavailable.</h1><p>Please contact Centre Neurodifferent for a current registration link.</p></section></main>;
  if (submitted) return <main className="public-page"><section className="public-card success-card"><CheckCircle2 size={42} /><p className="eyebrow">Enrollment received</p><h1>Thank you for registering.</h1><p>Centre Neurodifferent has received your enrollment for <strong>{link.program}</strong>. The team will contact you at the email address provided with next steps.</p></section></main>;

  return <main className="public-page"><section className="public-card"><div className="public-brand"><span className="brand-mark">N</span><span>Centre Neurodifferent</span></div><p className="eyebrow">Program enrollment</p><h1>{link.program}</h1><p className="public-lead">Complete this secure enrollment request. A team member will follow up with next steps.</p><form className="public-form" onSubmit={submit}><h2>Parent or guardian</h2><div className="form-grid"><label className="full-width">Full name<input name="parentName" value={form.parentName} onChange={update} required /></label><label>Email address<input type="email" name="parentEmail" value={form.parentEmail} onChange={update} required /></label><label>Telephone<input name="parentPhone" value={form.parentPhone} onChange={update} required /></label></div><h2>Child information</h2><div className="form-grid"><label>First name<input name="childFirstName" value={form.childFirstName} onChange={update} required /></label><label>Last name<input name="childLastName" value={form.childLastName} onChange={update} required /></label><label className="full-width">Date of birth<input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={update} required /></label></div><label className="consent"><input type="checkbox" name="consent" checked={form.consent} onChange={update} required /><span>I consent to Centre Neurodifferent collecting and using this information to process this enrollment and contact me about this program.</span></label>{error && <p className="form-message">{error}</p>}<button className="primary-button public-submit">Submit enrollment</button></form><p className="privacy-note"><ShieldCheck size={16} /> This prototype stores submitted information locally. Production hosting requires secure server-side storage.</p></section></main>;
}