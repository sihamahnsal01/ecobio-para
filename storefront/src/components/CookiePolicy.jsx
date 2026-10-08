import { openCookieSettings } from '../utils/consent';

// Drop this inside the existing <section id="cookies"> in privacy-policy.jsx,
// in place of (or below) the current paragraph.
export default function CookiePolicy() {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Name / type</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Category</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Login token (JWT)</td>
            <td>Eco&amp;Bio - para</td>
            <td>Keeps you signed in</td>
            <td>Essential</td>
            <td>7 days</td>
          </tr>
          <tr>
            <td>Cart and wishlist</td>
            <td>Eco&amp;Bio - para</td>
            <td>Remembers your selected products</td>
            <td>Essential</td>
            <td>Until cleared</td>
          </tr>
          <tr>
            <td>Cookie consent choice</td>
            <td>Eco&amp;Bio - para</td>
            <td>Remembers your cookie preferences</td>
            <td>Essential</td>
            <td>6 months</td>
          </tr>
          <tr>
            <td>Payment cookies</td>
            <td>Stripe</td>
            <td>Secure payment and fraud prevention</td>
            <td>Essential</td>
            <td>Set by Stripe</td>
          </tr>
          <tr>
            <td>Map tiles</td>
            <td>OpenStreetMap</td>
            <td>Displays the map on the About page (no cookies set; your IP address is used to load the tiles)</td>
            <td>Third-party content</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>

      <p>
        You can accept or reject non-essential cookies at any time, and delete cookies in your
        browser settings.
      </p>
      <button onClick={openCookieSettings}>Change cookie settings</button>
    </>
  );
}
