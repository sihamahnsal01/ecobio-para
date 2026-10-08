import { useConsent, saveConsent, getConsent } from '../utils/consent';

// Loads the Google Maps iframe only after the visitor accepts third-party content.
export default function ConsentGatedMap({ src, title = 'Store location', height = 380 }) {
  const consent = useConsent();

  if (consent?.thirdParty) {
    return (
      <iframe
        src={src}
        title={title}
        width="100%"
        height={height}
        style={{ border: 0, borderRadius: 12 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  const allow = () => {
    const c = getConsent() || {};
    saveConsent({ analytics: !!c.analytics, thirdParty: true });
  };

  return (
    <div
      style={{
        height,
        borderRadius: 12,
        background: '#D8F0E5',
        color: '#3C4D3C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        textAlign: 'center',
        padding: 20,
      }}
    >
      <p style={{ margin: 0, maxWidth: 380 }}>
        This map is provided by Google and may set cookies. Allow it to see our location.
      </p>
      <button
        onClick={allow}
        style={{
          background: '#3C4D3C',
          color: '#fff',
          border: 0,
          borderRadius: 8,
          padding: '10px 18px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Load Google Maps
      </button>
    </div>
  );
}
