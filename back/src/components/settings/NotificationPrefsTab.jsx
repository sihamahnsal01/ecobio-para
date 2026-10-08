import EmptyState from '../EmptyState.jsx'

function NotificationPrefsTab() {
  return (
    <EmptyState
      icon="fa-bell"
      title="Notification preferences are coming soon"
      description="This will let you choose which alerts you get by email vs. in-app (new orders, low stock, new reviews). It's separate from the sidebar's Notifications inbox, and needs the same backend work."
    />
  )
}

export default NotificationPrefsTab
