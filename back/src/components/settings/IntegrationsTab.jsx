import { useEffect, useState } from 'react'
import api from '../../api/client.js'

const ICONS = {
  google_analytics: 'fa-chart-line',
  mailchimp: 'fa-envelope-open-text',
  twilio_sms: 'fa-comment-sms',
  shopify_sync: 'fa-cart-shopping'
}

function IntegrationsTab() {
  const [integrations, setIntegrations] = useState(null)

  const load = () => api.get('/settings/integrations').then((data) => setIntegrations(data.integrations))

  useEffect(() => {
    load()
  }, [])

  if (!integrations) return <p className="muted-text">Loading…</p>

  const toggleConnected = async (integration) => {
    await api.put(`/settings/integrations/${integration.id}`, { connected: !integration.connected })
    load()
  }

  return (
    <div className="card settings-section">
      <h3>Integrations</h3>
      <p className="settings-section-sub">Connect third-party services to your store.</p>

      <div className="integrations-grid">
        {integrations.map((i) => (
          <div className="integration-card" key={i.id}>
            <div className="integration-icon">
              <i className={`fa-solid ${ICONS[i.id] || 'fa-plug'}`}></i>
            </div>
            <div className="integration-info">
              <p className="integration-name">{i.name}</p>
              <p className="integration-desc">{i.description}</p>
            </div>
            <div className="integration-actions">
              <button
                className={`btn btn-sm ${i.connected ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => toggleConnected(i)}
              >
                {i.connected ? 'Disconnect' : 'Connect'}
              </button>
              <button className="icon-btn">
                <i className="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IntegrationsTab
