function Brand({ compact = false }) {
  return (
    <a
      className={`brand${compact ? ' brand-compact' : ''}`}
      href="/"
      aria-label="Library home"
    >
      <span className="brand-mark">L</span>
      <span>Library<span className="brand-light">Space</span></span>
    </a>
  )
}

export default Brand
