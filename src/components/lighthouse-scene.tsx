export function LighthouseScene() {
  return (
    <svg className="lighthouse-scene" viewBox="0 0 720 740" aria-hidden="true">
      <defs>
        <linearGradient id="farol-sky" x2="0" y2="1"><stop stopColor="var(--scene-sky)" /><stop offset="1" stopColor="var(--scene-horizon)" /></linearGradient>
        <linearGradient id="farol-water" x2="0" y2="1"><stop stopColor="var(--scene-sea)" /><stop offset="1" stopColor="var(--scene-sky)" /></linearGradient>
        <linearGradient id="farol-beam"><stop stopColor="var(--scene-light)" stopOpacity=".7" /><stop offset="1" stopColor="var(--scene-light)" stopOpacity="0" /></linearGradient>
        <linearGradient id="farol-tower"><stop stopColor="var(--scene-stone)" /><stop offset=".5" stopColor="var(--scene-facade)" /><stop offset="1" stopColor="var(--scene-stone)" /></linearGradient>
        <filter id="farol-haze"><feGaussianBlur stdDeviation="13" /></filter>
        <filter id="farol-glow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <path fill="url(#farol-sky)" d="M0 0h720v740H0z" />
      <g fill="var(--scene-star)" opacity=".6"><circle cx="95" cy="116" r="1.5" /><circle cx="234" cy="76" r="1" /><circle cx="510" cy="93" r="1.5" /><circle cx="611" cy="210" r="1" /><circle cx="451" cy="185" r="1" /><circle cx="153" cy="226" r="1" /></g>
      <circle cx="554" cy="133" r="29" fill="var(--scene-moon)" opacity=".85" />
      <path d="M0 443Q130 419 270 439T720 430V740H0Z" fill="url(#farol-water)" />
      <g className="scene-fog" fill="var(--scene-fog)" filter="url(#farol-haze)" opacity=".23"><ellipse cx="495" cy="396" rx="258" ry="23" /><ellipse cx="148" cy="452" rx="229" ry="20" /><ellipse cx="583" cy="497" rx="172" ry="16" /></g>
      <g stroke="var(--scene-ripple)" fill="none" strokeWidth="1.5" opacity=".4"><path d="M32 485h96m256 10h160m57-27h90M90 544h142m254 8h140M30 617h152m182 13h210M189 703h111m230-27h102" /></g>
      <g className="scene-beam"><path d="M272 278L720 118V477Z" fill="url(#farol-beam)" /><path d="M272 278L720 233V350Z" fill="url(#farol-beam)" opacity=".5" /></g>
      <path d="M91 497l42-31 28-9 42-31 43-3 43 17 42 8 37 37 35 10-28 25H126Z" fill="var(--scene-rock)" />
      <path d="M132 474l47-20 45-21 53 8 45 21 26 18-68-7-70 9Z" fill="var(--scene-land)" />
      <path d="M238 443l10-142h47l15 142Z" fill="url(#farol-tower)" />
      <path d="M245 356h55l3 26h-60Z" fill="var(--scene-stripe)" />
      <path d="M260 443v-32a11 11 0 0 1 22 0v32" fill="var(--scene-rock)" />
      <path d="M264 323h10v17h-10z" fill="var(--scene-rock)" />
      <path d="M240 297h61v9h-61zM243 262h55v8h-55z" fill="var(--scene-roof)" />
      <path d="M247 262l24-20 24 20Z" fill="var(--scene-roof)" />
      <path d="M247 270h48v25h-48Z" fill="var(--scene-light)" opacity=".9" />
      <path d="M249 268v28m23-28v28m22-28v28" stroke="var(--scene-roof)" strokeWidth="4" />
      <circle cx="272" cy="278" r="16" fill="var(--scene-light)" opacity=".6" filter="url(#farol-glow)" />
      <g className="scene-boat"><path d="M495 503h92l-17 19h-57Z" fill="var(--scene-boat)" /><path d="M537 452v51" stroke="var(--scene-facade)" strokeWidth="2" /><path d="M533 456l-30 39h30Z" fill="var(--scene-facade)" /><path d="M542 468l23 27h-23Z" fill="var(--scene-stone)" /><path d="M500 530q40 9 80 0" stroke="var(--scene-light)" fill="none" opacity=".4" /><path className="boat-halo" d="M479 522q61 29 123 0" stroke="var(--scene-light)" strokeWidth="5" filter="url(#farol-glow)" fill="none" /></g>
    </svg>
  );
}