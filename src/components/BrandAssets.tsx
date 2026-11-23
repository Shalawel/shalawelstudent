import React from 'react';

export const TutorCloudLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 select-none ${className}`}>
    <svg
      width="34"
      height="30"
      viewBox="0 0 38 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Stylized orange 't' */}
      <path
        d="M8.5 3.5V22.5C8.5 26.2 11.2 28.8 15 28.8H17.5"
        stroke="#F59E0B"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 11.5H15.5"
        stroke="#F59E0B"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      {/* Interlocking orange 'c' */}
      <path
        d="M32.5 14.2C31.1 11.8 28.4 10.5 25.4 10.5C20.5 10.5 16.8 14.3 16.8 19.6C16.8 24.9 20.5 28.7 25.4 28.7C28.5 28.7 31.2 27.3 32.6 24.9"
        stroke="#F97316"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
    <span className="font-display text-[17px] font-bold tracking-tight text-white whitespace-nowrap">
      Tutor Cloud
    </span>
  </div>
);

export const AiMascotRobot: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`animate-gentle-float drop-shadow-[0_14px_20px_rgba(7,22,58,0.45)] ${className}`}
  >
    <defs>
      <linearGradient id="robotBody" x1="50" y1="20" x2="140" y2="165" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="65%" stopColor="#EBF2FF" />
        <stop offset="100%" stopColor="#CBD8F5" />
      </linearGradient>
      <linearGradient id="robotVisor" x1="55" y1="42" x2="128" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0E2046" />
        <stop offset="100%" stopColor="#193568" />
      </linearGradient>
      <linearGradient id="robotOrange" x1="40" y1="90" x2="135" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFB020" />
        <stop offset="100%" stopColor="#EC7A08" />
      </linearGradient>
    </defs>

    {/* Subtle glow halo behind mascot */}
    <circle cx="95" cy="92" r="66" fill="#60A5FA" fillOpacity="0.14" />

    {/* Antennae */}
    <path d="M84 36L77 18" stroke="#E2ECFF" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="76" cy="16" r="5" fill="#F59E0B" />
    <path d="M110 38L120 21" stroke="#E2ECFF" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="121" cy="19" r="5" fill="#F59E0B" />

    {/* Floating shadow underneath */}
    <ellipse cx="96" cy="164" rx="28" ry="6" fill="#0A1B42" fillOpacity="0.35" />

    {/* Left raised arm (thumbs-up gesture) */}
    <g transform="rotate(-14 48 102)">
      <rect x="28" y="84" width="24" height="36" rx="12" fill="url(#robotBody)" stroke="#C7D7F5" strokeWidth="1.5" />
      <rect x="33" y="96" width="14" height="6" rx="3" fill="url(#robotOrange)" />
      {/* Thumbs up hand */}
      <circle cx="36" cy="76" r="12" fill="url(#robotBody)" />
      <rect x="31" y="57" width="8" height="16" rx="4" fill="#FFFFFF" stroke="#D2DFFA" strokeWidth="1" />
    </g>

    {/* Right arm resting */}
    <g transform="rotate(18 138 112)">
      <rect x="128" y="102" width="22" height="34" rx="11" fill="url(#robotBody)" stroke="#C7D7F5" strokeWidth="1.5" />
      <circle cx="140" cy="138" r="9.5" fill="#EBF2FF" />
    </g>

    {/* Torso */}
    <path
      d="M66 100C66 91 73 86 95 86C117 86 125 91 125 100L121 136C119 148 109 154 95 154C81 154 71 148 69 136L66 100Z"
      fill="url(#robotBody)"
      stroke="#D5E3FC"
      strokeWidth="1.5"
    />

    {/* Orange trim belt & shoulder accents */}
    <path d="M68 107C79 112 111 112 123 107" stroke="url(#robotOrange)" strokeWidth="4" strokeLinecap="round" />
    <path d="M72 138C82 143 108 143 118 138" stroke="url(#robotOrange)" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="95" cy="124" r="13" fill="#FFF7ED" stroke="#F59E0B" strokeWidth="2" />
    <text
      x="95"
      y="129"
      textAnchor="middle"
      fill="#EA580C"
      fontSize="13"
      fontWeight="800"
      fontFamily="Plus Jakarta Sans, sans-serif"
    >
      tc
    </text>

    {/* Head */}
    <rect
      x="56"
      y="34"
      width="78"
      height="58"
      rx="26"
      fill="url(#robotBody)"
      stroke="#DCE8FF"
      strokeWidth="2"
    />
    {/* Ear pods */}
    <rect x="49" y="54" width="9" height="18" rx="4.5" fill="url(#robotOrange)" />
    <rect x="132" y="54" width="9" height="18" rx="4.5" fill="url(#robotOrange)" />

    {/* Dark glossy face visor */}
    <rect x="65" y="44" width="60" height="37" rx="16" fill="url(#robotVisor)" />

    {/* Glowing cyan happy eyes */}
    <circle cx="83" cy="60" r="6" fill="#38BDF8" />
    <circle cx="85" cy="58" r="2.2" fill="#FFFFFF" />
    <circle cx="107" cy="60" r="6" fill="#38BDF8" />
    <circle cx="109" cy="58" r="2.2" fill="#FFFFFF" />

    {/* Cheerful smile */}
    <path
      d="M87 70.5C90.5 74.5 99.5 74.5 103 70.5"
      stroke="#38BDF8"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Feet thrusters */}
    <ellipse cx="83" cy="155" rx="8" ry="4" fill="#F59E0B" />
    <ellipse cx="107" cy="155" rx="8" ry="4" fill="#F59E0B" />
  </svg>
);

export const StudentAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`rounded-full shrink-0 ${className}`}
  >
    <circle cx="32" cy="32" r="31" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
    {/* Hair back */}
    <path d="M16 32C16 19 22 12 32 12C42 12 48 19 48 32V46H16V32Z" fill="#5B3A29" />
    {/* Shoulders */}
    <path d="M12 60C14 48 22 44 32 44C42 44 50 48 52 60" fill="#1E40AF" />
    {/* Neck */}
    <rect x="27" y="38" width="10" height="9" rx="4" fill="#F3C4A4" />
    {/* Face */}
    <ellipse cx="32" cy="30" rx="11.5" ry="13" fill="#F6CBB0" />
    {/* Front bangs */}
    <path d="M20 26C21 17 26 14 32 14C39 14 43 18 44 26C40 21 35 19 29 20C25 21 22 23 20 26Z" fill="#4A2E20" />
    {/* Eyes & warm smile */}
    <circle cx="27.5" cy="29.5" r="1.5" fill="#1E293B" />
    <circle cx="36.5" cy="29.5" r="1.5" fill="#1E293B" />
    <path d="M28.5 35C30.2 37 33.8 37 35.5 35" stroke="#9A3412" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const PeerAvatarStack: React.FC = () => {
  const peers = [
    { bg: '#FDE68A', shirt: '#EA580C', hair: '#451A03', skin: '#F3C4A4' },
    { bg: '#BAE6FD', shirt: '#0369A1', hair: '#1E293B', skin: '#D9A07E' },
    { bg: '#BBF7D0', shirt: '#15803D', hair: '#713F12', skin: '#F8D5BD' },
  ];
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {peers.map((p, idx) => (
          <svg
            key={idx}
            width="28"
            height="28"
            viewBox="0 0 36 36"
            className="rounded-full ring-2 ring-white"
            aria-hidden="true"
          >
            <circle cx="18" cy="18" r="18" fill={p.bg} />
            <path d="M6 36C8 27 12 24 18 24C24 24 28 27 30 36" fill={p.shirt} />
            <circle cx="18" cy="14" r="6.5" fill={p.skin} />
            <path d="M11.5 13C12 8.5 15 6.5 18 6.5C21.5 6.5 24 8.5 24.5 13C22 10 15 10 11.5 13Z" fill={p.hair} />
          </svg>
        ))}
      </div>
      <span className="ml-1 inline-flex items-center justify-center h-7 px-2 rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] font-bold tabular-nums ring-2 ring-white">
        +12
      </span>
    </div>
  );
};
