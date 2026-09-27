import { useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

export default function Access({ onAuthenticate }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const result = onAuthenticate({ mode, name, email });
    setMessage(result || "");
  };

  return <main className="access-page">
    <section className="access-intro">
      <div className="access-brand"><span className="brand-mark">N</span><span>Neuro<span>CRM</span></span></div>
      <div className="access-copy"><p className="eyebrow">Centre Neurodifferent</p><h1>Care records, kept close.</h1><p>Manage families, service hours, and reimbursement records from one calm workspace.</p></div>
      <div className="access-note"><Sparkles size={18} /> <span>This demo stores data in this browser only.</span></div>
    </section>
    <section className="access-panel">
      <div className="access-card">
        <div className="access-tabs"><button type="button" className={mode === "signin" ? "selected" : ""} onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button><button type="button" className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Create account</button></div>
        <div className="access-heading"><LockKeyhole size={21} /><div><h2>{mode === "signin" ? "Welcome back" : "Set up your workspace"}</h2><p>{mode === "signin" ? "Use the email you registered with." : "Create a local demonstration account."}</p></div></div>
        <form onSubmit={submit} className="access-form">
          {mode === "register" && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" /></label>}
          <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          {message && <p className="form-message">{message}</p>}
          <button className="primary-button access-submit">{mode === "signin" ? "Enter CRM" : "Create account"} <ArrowRight size={17} /></button>
        </form>
      </div>
    </section>
  </main>;
}