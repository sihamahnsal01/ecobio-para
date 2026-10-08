import { useEffect, useState } from 'react'
import api from '../../api/client.js'

function CmsTab() {
  const [cms, setCms] = useState(null)
  const [hero, setHero] = useState(null)
  const [footer, setFooter] = useState(null)
  const [savingHero, setSavingHero] = useState(false)
  const [savingFooter, setSavingFooter] = useState(false)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' })
  const [openFaqId, setOpenFaqId] = useState(null)

  const load = () =>
    api.get('/settings/cms').then((data) => {
      setCms(data)
      setHero(data.hero)
      setFooter(data.footer)
    })

  useEffect(() => {
    load()
  }, [])

  if (!cms) return <p className="muted-text">Loading…</p>

  const saveHero = async () => {
    setSavingHero(true)
    await api.put('/settings/cms', { hero })
    setSavingHero(false)
    load()
  }

  const saveFooter = async () => {
    setSavingFooter(true)
    await api.put('/settings/cms', { footer })
    setSavingFooter(false)
    load()
  }

  const addFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return
    await api.post('/settings/cms/faqs', newFaq)
    setNewFaq({ question: '', answer: '', category: 'General' })
    load()
  }

  const deleteFaq = async (id) => {
    await api.del(`/settings/cms/faqs/${id}`)
    load()
  }

  return (
    <>
      {/* Homepage Editor */}
      <div className="card settings-section">
        <h3>Homepage Editor</h3>
        <p className="settings-section-sub">Change the main hero section content.</p>

        <div className="field">
          <label>Hero Image URL</label>
          <input value={hero.image} onChange={(e) => setHero({ ...hero, image: e.target.value })} placeholder="https://…" />
        </div>
        <div className="field">
          <label>Headline</label>
          <input value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} />
        </div>
        <div className="field">
          <label>Button Text</label>
          <input value={hero.buttonText} onChange={(e) => setHero({ ...hero, buttonText: e.target.value })} />
        </div>

        <button className="btn btn-primary settings-save-btn" onClick={saveHero} disabled={savingHero}>
          {savingHero ? 'Saving…' : 'Save Homepage'}
        </button>
      </div>

      {/* FAQ Manager */}
      <div className="card settings-section">
        <h3>FAQ Manager</h3>
        <p className="settings-section-sub">Manage the FAQs shown in the accordion on the Contact page.</p>

        <div className="faq-manager-list">
          {cms.faqs.map((f) => (
            <div className="faq-manager-item" key={f._id}>
              <button className="faq-manager-question" onClick={() => setOpenFaqId(openFaqId === f._id ? null : f._id)}>
                <span>{f.question}</span>
                <span className="faq-manager-actions">
                  <i className={`fa-solid ${openFaqId === f._id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  <i className="fa-solid fa-trash" onClick={(e) => { e.stopPropagation(); deleteFaq(f._id) }}></i>
                </span>
              </button>
              {openFaqId === f._id && <p className="faq-manager-answer">{f.answer}</p>}
            </div>
          ))}
        </div>

        <div className="faq-new-form">
          <div className="field">
            <label>Question</label>
            <input value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} />
          </div>
          <div className="field">
            <label>Answer</label>
            <textarea rows={3} value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={newFaq.category} onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })} />
          </div>
          <button className="btn btn-primary settings-save-btn" onClick={addFaq}>
            <i className="fa-solid fa-plus"></i> Add Category
          </button>
        </div>
      </div>

      {/* Footer Configuration */}
      <div className="card settings-section">
        <h3>Footer Configuration</h3>
        <p className="settings-section-sub">Edit the contact info and social links shown in the footer.</p>

        <div className="field">
          <label>Address</label>
          <input value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>City / Postal Code</label>
            <input value={footer.city} onChange={(e) => setFooter({ ...footer, city: e.target.value })} />
          </div>
          <div className="field">
            <label>Contact Email</label>
            <input value={footer.email} onChange={(e) => setFooter({ ...footer, email: e.target.value })} />
          </div>
        </div>

        <p className="settings-section-sub" style={{ marginTop: 10 }}>Social links</p>
        <div className="field-row">
          <div className="field">
            <label>Twitter</label>
            <input value={footer.social.twitter} onChange={(e) => setFooter({ ...footer, social: { ...footer.social, twitter: e.target.value } })} />
          </div>
          <div className="field">
            <label>Facebook</label>
            <input value={footer.social.facebook} onChange={(e) => setFooter({ ...footer, social: { ...footer.social, facebook: e.target.value } })} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Instagram</label>
            <input value={footer.social.instagram} onChange={(e) => setFooter({ ...footer, social: { ...footer.social, instagram: e.target.value } })} />
          </div>
          <div className="field">
            <label>LinkedIn</label>
            <input value={footer.social.linkedin} onChange={(e) => setFooter({ ...footer, social: { ...footer.social, linkedin: e.target.value } })} />
          </div>
        </div>

        <button className="btn btn-primary settings-save-btn" onClick={saveFooter} disabled={savingFooter}>
          {savingFooter ? 'Saving…' : 'Save Footer'}
        </button>
      </div>
    </>
  )
}

export default CmsTab
