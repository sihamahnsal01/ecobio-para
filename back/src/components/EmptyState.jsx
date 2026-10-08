function EmptyState({ icon = 'fa-circle-info', title, description }) {
  return (
    <div className="card empty-state">
      <div className="empty-state-icon">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h3>{title}</h3>
      <p className="muted-text">{description}</p>
    </div>
  )
}

export default EmptyState
