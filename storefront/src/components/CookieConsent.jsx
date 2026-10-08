import { useEffect, useState } from 'react';
import { getConsent, saveConsent } from '../utils/consent';
import '../assets/styles/CookieConsent.css';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
      setThirdParty(existing.thirdParty);
    }
    const reopen = () => {
      const c = getConsent();
      setAnalytics(!!c?.analytics);
      setThirdParty(!!c?.thirdParty);
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener('open-cookie-settings', reopen);
    return () => window.removeEventListener('open-cookie-settings', reopen);
  }, []);

  const close = (choice) => {
    saveConsent(choice);
    setVisible(false);
    setShowDetails(false);
  };

  if (!visible) return null;

  return (
    <div className="cc-wrap" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="cc-card">
        <h3 className="cc-title">We value your privacy</h3>
        <p className="cc-text">
          Eco&amp;Bio - para uses essential cookies so the store works (login, cart, secure payment).
          With your permission we also use optional cookies for embedded maps and to understand how
          the site is used. You can change your choice at any time.{' '}
          <a href="/privacy-policy">Read our cookie policy</a>.
        </p>

        {showDetails && (
          <div className="cc-details">
            <label className="cc-row">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Essential</strong> (always on)
                <small>Login, cart, wishlist, secure checkout with Stripe.</small>
              </span>
            </label>
            <label className="cc-row">
              <input
                type="checkbox"
                checked={thirdParty}
                onChange={(e) => setThirdParty(e.target.checked)}
              />
              <span>
                <strong>Third-party content</strong>
                <small>Google Maps embed on the Contact page.</small>
              </span>
            </label>
            <label className="cc-row">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span>
                <strong>Analytics</strong>
                <small>Anonymous statistics to improve the store (none active yet).</small>
              </span>
            </label>
          </div>
        )}

        <div className="cc-actions">
          <button className="cc-btn cc-ghost" onClick={() => close({})}>
            Reject non-essential
          </button>
          {showDetails ? (
            <button className="cc-btn cc-outline" onClick={() => close({ analytics, thirdParty })}>
              Save my choices
            </button>
          ) : (
            <button className="cc-btn cc-outline" onClick={() => setShowDetails(true)}>
              Customize
            </button>
          )}
          <button
            className="cc-btn cc-primary"
            onClick={() => close({ analytics: true, thirdParty: true })}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
