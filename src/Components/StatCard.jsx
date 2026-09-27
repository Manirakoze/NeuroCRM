export default function StatCard({ label, value, detail, tone = "teal" }) {
	return (
		<article className={`stat-card ${tone}`}>
			<p>{label}</p>
			<strong>{value}</strong>
			<span>{detail}</span>
		</article>
	);
}
