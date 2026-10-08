import EmptyState from '../components/EmptyState.jsx'

function Reports() {
  return (
    <div className="page-stub">
      <EmptyState
        icon="fa-file-lines"
        title="Reports are coming soon"
        description="This screen will let you export sales, inventory, and customer reports as CSV/PDF over a chosen date range. It needs report-generation endpoints on the backend, which don't exist yet."
      />
    </div>
  )
}

export default Reports
