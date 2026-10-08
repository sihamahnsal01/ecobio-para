import EmptyState from '../EmptyState.jsx'

function SecurityTab() {
  return (
    <EmptyState
      icon="fa-shield-halved"
      title="Security settings are coming soon"
      description="This will let you change your password and (eventually) enable two-factor authentication. It needs a PUT /api/auth/password endpoint, which doesn't exist yet — the User model already hashes passwords with bcrypt, so this is a small addition."
    />
  )
}

export default SecurityTab
