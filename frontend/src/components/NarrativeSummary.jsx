export default function NarrativeSummary({ text }) {
  return (
    <div className="border-l-4 border-accent bg-accent/5 rounded-r-md px-4 py-3">
      <p className="text-sm text-ink/70 italic leading-relaxed">{text}</p>
    </div>
  )
}
