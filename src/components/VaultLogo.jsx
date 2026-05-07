export default function VaultLogo({ size = 80, className = '' }) {
  return (
    <svg
      viewBox="140 40 400 400"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Vault logo"
    >
      <rect x="140" y="40" width="400" height="400" rx="88" ry="88" fill="#07070f"/>
      <circle cx="340" cy="240" r="140" fill="none" stroke="#1D9E75" strokeWidth="1.5"/>
      <circle cx="340" cy="240" r="118" fill="none" stroke="#1D9E75" strokeWidth="8"/>
      <circle cx="340" cy="240" r="98" fill="#0a0f0d"/>
      <circle cx="340" cy="240" r="72" fill="none" stroke="#1D9E75" strokeWidth="1" strokeDasharray="4 4"/>
      <line x1="340" y1="122" x2="340" y2="148" stroke="#1D9E75" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="340" y1="332" x2="340" y2="358" stroke="#1D9E75" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="200" y1="240" x2="226" y2="240" stroke="#1D9E75" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="454" y1="240" x2="480" y2="240" stroke="#1D9E75" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="240" y1="142" x2="253" y2="163" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"/>
      <line x1="440" y1="142" x2="427" y2="163" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"/>
      <line x1="440" y1="338" x2="427" y2="317" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"/>
      <line x1="240" y1="338" x2="253" y2="317" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="340" cy="240" r="28" fill="#0F6E56"/>
      <circle cx="340" cy="240" r="18" fill="#1D9E75"/>
      <circle cx="340" cy="240" r="8" fill="#07070f"/>
      <line x1="340" y1="212" x2="340" y2="240" stroke="#5DCAA5" strokeWidth="3" strokeLinecap="round"/>
      <line x1="340" y1="240" x2="362" y2="240" stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round"/>
      <rect x="445" y="195" width="18" height="28" rx="4" fill="#1D9E75"/>
      <rect x="216" y="195" width="18" height="28" rx="4" fill="#1D9E75"/>
    </svg>
  );
}
