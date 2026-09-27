import { CalendarDays, Search } from "lucide-react";

export default function Topbar() {
	const today = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());

	return (
		<header className="topbar">
			<div className="workspace-label">Practice workspace <span>Northside Clinic</span></div>
			<div className="topbar-actions">
				<div className="date-label"><CalendarDays size={17} /> {today}</div>
				<button className="icon-button" type="button" aria-label="Search records" title="Search records"><Search size={19} /></button>
				<div className="avatar" aria-label="Signed in as AP">AP</div>
			</div>
		</header>
	);
}
