import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProfileTab from '../components/settings/ProfileTab.jsx'
import AccountTab from '../components/settings/AccountTab.jsx'
import SecurityTab from '../components/settings/SecurityTab.jsx'
import NotificationPrefsTab from '../components/settings/NotificationPrefsTab.jsx'
import GeneralTab from '../components/settings/GeneralTab.jsx'
import CmsTab from '../components/settings/CmsTab.jsx'
import PaymentsTab from '../components/settings/PaymentsTab.jsx'
import ShippingTab from '../components/settings/ShippingTab.jsx'
import IntegrationsTab from '../components/settings/IntegrationsTab.jsx'
import TeamTab from '../components/settings/TeamTab.jsx'
import '../styles/Settings.css'

// The first 5 tabs mirror the sidebar's "Settings" submenu.
// The rest (storefront CMS, payments, shipping, integrations, team) were
// already built for the store-configuration side of things — kept here so
// nothing that used to work gets lost.
const TABS = [
  { id: 'profile', label: 'My Profile' },
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'general', label: 'Store Settings' },
  { id: 'cms', label: 'Storefront CMS' },
  { id: 'payments', label: 'Payments' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'team', label: 'Team Permissions' },
]

function Settings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [tab, setTab] = useState(tabFromUrl && TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'profile')

  // Sidebar links carry ?tab=..., so re-sync if it changes while this
  // page is already mounted (e.g. clicking a different Settings submenu item).
  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl) && tabFromUrl !== tab) {
      setTab(tabFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl])

  const selectTab = (id) => {
    setTab(id)
    setSearchParams({ tab: id })
  }

  return (
    <div className="settings-page">
      <aside className="settings-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`settings-nav-item${tab === t.id ? ' active' : ''}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </aside>

      <div className="settings-content">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'account' && <AccountTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'notifications' && <NotificationPrefsTab />}
        {tab === 'general' && <GeneralTab />}
        {tab === 'cms' && <CmsTab />}
        {tab === 'payments' && <PaymentsTab />}
        {tab === 'shipping' && <ShippingTab />}
        {tab === 'integrations' && <IntegrationsTab />}
        {tab === 'team' && <TeamTab />}
      </div>
    </div>
  )
}

export default Settings
