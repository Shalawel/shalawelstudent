import React from 'react';
import type {
  PrecipitationForm,
  WaterCycleStageId,
  WeatherConditionId,
} from '../utils/waterCycleLogic';

export interface WaterCycleSceneCanvasProps {
  /** 'mystery' hides scientific term names for Ch 1; 'full' shows all 4 stage labels; 'stage' highlights one stage; 'weather' emphasizes weather conditions */
  mode: 'mystery' | 'stage' | 'weather' | 'connection';
  highlightStage?: WaterCycleStageId;
  weather?: WeatherConditionId;
  precipitationForm?: PrecipitationForm;
  sunHeat?: 'low' | 'medium' | 'high';
  windSpeed?: 'calm' | 'breezy' | 'strong';
  showMicroscopic?: boolean;
  paused?: boolean;
  activeHotspot?: 'sun' | 'ocean' | 'clouds' | 'river' | null;
  onSelectHotspot?: (spot: 'sun' | 'ocean' | 'clouds' | 'river') => void;
}

const SKY_GRADIENTS: Record<WeatherConditionId, { top: string; bottom: string }> = {
  sunny: { top: '#38BDF8', bottom: '#E0F2FE' },
  cloudy: { top: '#64748B', bottom: '#CBD5E1' },
  rainy: { top: '#475569', bottom: '#94A3B8' },
  windy: { top: '#0284C7', bottom: '#BAE6FD' },
  stormy: { top: '#1E293B', bottom: '#475569' },
};

export const WaterCycleSceneCanvas: React.FC<WaterCycleSceneCanvasProps> = ({
  mode,
  highlightStage,
  weather = 'sunny',
  precipitationForm = 'rain',
  sunHeat = 'medium',
  windSpeed = 'calm',
  showMicroscopic = false,
  paused = false,
  activeHotspot = null,
  onSelectHotspot,
}) => {
  const effectiveWeather: WeatherConditionId =
    mode === 'stage' && highlightStage === 'precipitation'
      ? 'rainy'
      : mode === 'stage' && highlightStage === 'condensation'
      ? 'cloudy'
      : weather;

  const sky = SKY_GRADIENTS[effectiveWeather];

  const showVapour =
    mode === 'mystery' ||
    mode === 'connection' ||
    (mode === 'stage' && (highlightStage === 'evaporation' || highlightStage === 'condensation')) ||
    (mode === 'weather' && effectiveWeather === 'sunny');

  const showPrecipitation =
    mode === 'mystery' ||
    (mode === 'stage' && (highlightStage === 'precipitation' || highlightStage === 'collection')) ||
    effectiveWeather === 'rainy' ||
    effectiveWeather === 'stormy';

  const showWindRibbons =
    effectiveWeather === 'windy' ||
    effectiveWeather === 'stormy' ||
    windSpeed === 'strong' ||
    (mode === 'connection' && windSpeed === 'breezy');

  const showLightning = effectiveWeather === 'stormy';

  const darkClouds =
    effectiveWeather === 'rainy' ||
    effectiveWeather === 'stormy' ||
    (mode === 'stage' && highlightStage === 'precipitation');

  const sunScale =
    sunHeat === 'high' || effectiveWeather === 'sunny'
      ? 1.12
      : sunHeat === 'low' || effectiveWeather === 'stormy'
      ? 0.85
      : 1;

  const sunOpacity =
    effectiveWeather === 'stormy'
      ? 0.32
      : effectiveWeather === 'rainy'
      ? 0.45
      : effectiveWeather === 'cloudy'
      ? 0.65
      : 1;

  const vapourCount =
    sunHeat === 'high' || highlightStage === 'evaporation' ? 7 : sunHeat === 'low' ? 3 : 5;

  const rainCount = effectiveWeather === 'stormy' ? 16 : 11;

  const isStageEmphasized = (stage: WaterCycleStageId) =>
    mode === 'stage' ? highlightStage === stage : true;

  return (
    <div
      data-testid="water-cycle-canvas"
      className={`relative w-full overflow-hidden rounded-2xl border border-sky-200/90 bg-sky-50 shadow-sm select-none ${
        paused ? 'wc-paused' : ''
      }`}
    >
      <svg
        viewBox="0 0 840 390"
        className="block w-full h-auto"
        role="img"
        aria-label="Animated Water Cycle and Weather landscape featuring the Sun, ocean, rising water vapour, clouds, rain, mountains, rivers, trees, and underground water"
      >
        <defs>
          <linearGradient id="wc-sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.top} />
            <stop offset="100%" stopColor={sky.bottom} />
          </linearGradient>

          <radialGradient id="wc-sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="wc-ocean-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          <linearGradient id="wc-mountain-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="wc-mountain-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="wc-hill-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>

          <linearGradient id="wc-soil-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="60%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <marker
            id="wc-arrowhead-amber"
            markerWidth="8"
            markerHeight="8"
            refX="5"
            refY="4"
            orient="auto"
          >
            <path d="M0,1 L7,4 L0,7 Z" fill="#F59E0B" />
          </marker>
          <marker
            id="wc-arrowhead-sky"
            markerWidth="8"
            markerHeight="8"
            refX="5"
            refY="4"
            orient="auto"
          >
            <path d="M0,1 L7,4 L0,7 Z" fill="#0284C7" />
          </marker>
          <marker
            id="wc-arrowhead-emerald"
            markerWidth="8"
            markerHeight="8"
            refX="5"
            refY="4"
            orient="auto"
          >
            <path d="M0,1 L7,4 L0,7 Z" fill="#10B981" />
          </marker>
        </defs>

        {/* SKY BACKDROP */}
        <rect x="0" y="0" width="840" height="390" fill="url(#wc-sky-grad)" />

        {/* SUN & ROTATING SUNBEAMS */}
        <g
          opacity={sunOpacity}
          transform={`translate(115, 76) scale(${sunScale})`}
          className={onSelectHotspot ? 'cursor-pointer' : ''}
          onClick={() => onSelectHotspot?.('sun')}
        >
          <circle cx="0" cy="0" r="64" fill="url(#wc-sun-glow)" />
          <g className="wc-sun-rays">
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = idx * 30;
              return (
                <line
                  key={angle}
                  x1="0"
                  y1="-37"
                  x2="0"
                  y2="-50"
                  stroke="#FDE047"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${angle})`}
                />
              );
            })}
          </g>
          <circle cx="0" cy="0" r="30" fill="#FACC15" stroke="#FEF08A" strokeWidth="3" />
          {/* Warmth beam toward ocean during evaporation */}
          {(highlightStage === 'evaporation' || sunHeat === 'high') && (
            <path
              d="M 10 34 L 58 176 L 146 176 L 34 26 Z"
              fill="#FEF08A"
              opacity="0.18"
            />
          )}
        </g>

        {/* DISTANT & NEAR MOUNTAINS */}
        <path
          d="M 410 278 L 535 128 L 652 278 Z"
          fill="url(#wc-mountain-far)"
        />
        {/* Far mountain snowcap */}
        <path
          d="M 535 128 L 502 168 L 520 163 L 535 174 L 552 162 L 568 170 Z"
          fill="#F8FAFC"
        />

        <path
          d="M 548 278 L 690 98 L 840 278 Z"
          fill="url(#wc-mountain-near)"
        />
        {/* Tall peak snowcap */}
        <path
          d="M 690 98 L 648 152 L 668 145 L 690 158 L 712 146 L 732 152 Z"
          fill="#FFFFFF"
        />

        {/* GREEN VALLEY HILLS & LAND */}
        <path
          d="M 355 288 Q 455 215 585 256 Q 710 220 840 250 L 840 345 L 355 345 Z"
          fill="url(#wc-hill-grad)"
        />

        {/* WINDING RIVER FLOWING FROM MOUNTAINS TO OCEAN (COLLECTION) */}
        <path
          d="M 662 184 C 625 210, 622 235, 578 250 C 528 266, 495 256, 442 276 C 412 287, 388 294, 354 298 L 354 316 C 396 312, 434 300, 468 286 C 512 269, 545 276, 594 259 C 632 246, 646 218, 676 190 Z"
          fill="#38BDF8"
          stroke="#7DD3FC"
          strokeWidth="1.5"
        />

        {/* OCEAN BASIN (LEFT SIDE) */}
        <g
          className={onSelectHotspot ? 'cursor-pointer' : ''}
          onClick={() => onSelectHotspot?.('ocean')}
        >
          <path
            d="M 0 286 Q 90 278 180 286 Q 270 294 370 286 L 370 390 L 0 390 Z"
            fill="url(#wc-ocean-grad)"
          />
          {/* Subtle ocean wave highlights */}
          <path
            d="M 28 306 Q 60 299 92 306 M 140 314 Q 175 307 210 314 M 248 304 Q 282 297 316 304 M 72 336 Q 112 329 152 336 M 204 342 Q 244 335 284 342"
            stroke="#BAE6FD"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </g>

        {/* UNDERGROUND SOIL & GROUNDWATER AQUIFER CUTAWAY (RIGHT BOTTOM) */}
        <path
          d="M 358 332 L 840 332 L 840 390 L 358 390 Z"
          fill="url(#wc-soil-grad)"
        />
        {/* Underground water table ribbon flowing back toward ocean */}
        <path
          d="M 358 364 Q 485 358 610 368 Q 725 375 840 364 L 840 390 L 358 390 Z"
          fill="#0284C7"
          opacity="0.72"
        />
        <text
          x="655"
          y="381"
          fill="#E0F2FE"
          fontSize="10.5"
          fontWeight="700"
          textAnchor="middle"
        >
          Underground Water (Groundwater)
        </text>

        {/* TREES ON LAND (SWAY IN WINDY / STORMY WEATHER) */}
        {[
          { x: 422, y: 278, scale: 0.95 },
          { x: 454, y: 274, scale: 0.8 },
          { x: 525, y: 278, scale: 1.05 },
          { x: 755, y: 274, scale: 1.0 },
          { x: 790, y: 278, scale: 0.86 },
        ].map((tree, idx) => (
          <g
            key={idx}
            transform={`translate(${tree.x}, ${tree.y}) scale(${tree.scale})`}
          >
            <g className={showWindRibbons ? 'wc-tree-windy' : ''}>
              <rect x="-3.5" y="-12" width="7" height="16" rx="2" fill="#78350F" />
              <circle cx="0" cy="-22" r="13" fill="#15803D" />
              <circle cx="-7" cy="-16" r="9" fill="#16A34A" />
              <circle cx="8" cy="-16" r="9" fill="#22C55E" />
            </g>
          </g>
        ))}

        {/* RISING WATER VAPOUR (EVAPORATION — DISTINCT TRANSLUCENT WAVY GAS LINES) */}
        {showVapour && (
          <g opacity={isStageEmphasized('evaporation') ? 1 : 0.35}>
            {Array.from({ length: vapourCount }).map((_, idx) => {
              const x = 58 + idx * 44;
              const delay = `${(idx * 0.42).toFixed(2)}s`;
              return (
                <g key={x} className="wc-vapour" style={{ animationDelay: delay }}>
                  <path
                    d={`M ${x} 274 Q ${x - 9} 254 ${x} 234 Q ${x + 9} 214 ${x} 194`}
                    fill="none"
                    stroke="#E0F2FE"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    opacity="0.88"
                  />
                  <path
                    d={`M ${x - 4} 202 L ${x} 191 L ${x + 4} 202`}
                    fill="none"
                    stroke="#BAE6FD"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ANIMATED WIND RIBBONS */}
        {showWindRibbons && (
          <g>
            {[
              { y: 126, delay: '0s' },
              { y: 178, delay: '0.55s' },
              { y: 228, delay: '1.1s' },
            ].map((w) => (
              <path
                key={w.y}
                className="wc-wind-ribbon"
                style={{ animationDelay: w.delay }}
                d={`M 160 ${w.y} Q 250 ${w.y - 12} 340 ${w.y} T 520 ${w.y - 4}`}
                fill="none"
                stroke="#F8FAFC"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.78"
              />
            ))}
          </g>
        )}

        {/* CLOUDS (CONDENSATION — DISTINCT SOFT FLUFFY VS DARK HEAVY RAIN CLOUDS) */}
        <g
          className={onSelectHotspot ? 'cursor-pointer' : ''}
          onClick={() => onSelectHotspot?.('clouds')}
        >
          {/* Left condensing cumulus cloud (forming over ocean) */}
          {(effectiveWeather !== 'sunny' || mode !== 'weather') && (
            <g
              className="wc-cloud"
              opacity={
                effectiveWeather === 'sunny' && mode === 'weather'
                  ? 0.35
                  : isStageEmphasized('condensation')
                  ? 1
                  : 0.65
              }
            >
              <g transform="translate(235, 92)">
                <ellipse
                  cx="42"
                  cy="24"
                  rx="48"
                  ry="20"
                  fill={darkClouds ? '#94A3B8' : '#FFFFFF'}
                />
                <circle cx="18" cy="14" r="22" fill={darkClouds ? '#CBD5E1' : '#FFFFFF'} />
                <circle cx="46" cy="8" r="26" fill={darkClouds ? '#94A3B8' : '#F8FAFC'} />
                <circle cx="72" cy="16" r="19" fill={darkClouds ? '#CBD5E1' : '#FFFFFF'} />
              </g>
            </g>
          )}

          {/* Right main rain/precipitation cloud (over mountains) */}
          <g
            className="wc-cloud"
            style={{ animationDelay: '1.2s' }}
            opacity={
              effectiveWeather === 'sunny' && mode === 'weather'
                ? 0.28
                : isStageEmphasized('precipitation') || isStageEmphasized('condensation')
                ? 1
                : 0.65
            }
          >
            <g transform="translate(500, 74)">
              <ellipse
                cx="64"
                cy="30"
                rx="74"
                ry="24"
                fill={darkClouds ? '#475569' : '#E2E8F0'}
              />
              <circle cx="24" cy="18" r="26" fill={darkClouds ? '#64748B' : '#FFFFFF'} />
              <circle cx="62" cy="8" r="32" fill={darkClouds ? '#475569' : '#F8FAFC'} />
              <circle cx="102" cy="16" r="25" fill={darkClouds ? '#64748B' : '#FFFFFF'} />
              <circle cx="126" cy="26" r="18" fill={darkClouds ? '#475569' : '#E2E8F0'} />
            </g>
          </g>
        </g>

        {/* LIGHTNING IN STORMY WEATHER */}
        {showLightning && (
          <path
            className="wc-lightning"
            d="M 565 124 L 548 164 L 566 164 L 551 208 L 586 154 L 567 154 L 580 124 Z"
            fill="#FDE047"
            stroke="#FEF9C3"
            strokeWidth="1.5"
          />
        )}

        {/* PRECIPITATION (RAIN / SNOW / HAIL) */}
        {showPrecipitation && (
          <g opacity={isStageEmphasized('precipitation') ? 1 : 0.4}>
            {Array.from({ length: rainCount }).map((_, idx) => {
              const x = 514 + (idx % 8) * 18 + (idx >= 8 ? 8 : 0);
              const y = 128 + (idx % 3) * 20;
              const delay = `${((idx * 0.17) % 1.2).toFixed(2)}s`;

              if (precipitationForm === 'snow') {
                return (
                  <g
                    key={idx}
                    className="wc-snow"
                    style={{ animationDelay: delay }}
                  >
                    <circle cx={x} cy={y} r="3.4" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
                  </g>
                );
              }

              if (precipitationForm === 'hail') {
                return (
                  <g
                    key={idx}
                    className="wc-rain"
                    style={{ animationDelay: delay }}
                  >
                    <polygon
                      points={`${x},${y - 4} ${x + 4},${y} ${x},${y + 4} ${x - 4},${y}`}
                      fill="#E0F2FE"
                      stroke="#38BDF8"
                      strokeWidth="1.2"
                    />
                  </g>
                );
              }

              return (
                <line
                  key={idx}
                  x1={x}
                  y1={y}
                  x2={x - 4}
                  y2={y + 13}
                  stroke="#0284C7"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  className="wc-rain"
                  style={{ animationDelay: delay }}
                />
              );
            })}
          </g>
        )}

        {/* DIRECTIONAL CYCLE ARROWS (SMOOTH CONTINUOUS MOTION) */}
        {(mode === 'stage' || mode === 'connection' || mode === 'mystery') && (
          <g>
            {/* Evaporation arrow: Ocean -> Clouds */}
            <path
              d="M 195 272 C 195 208, 222 162, 258 134"
              fill="none"
              stroke="#F59E0B"
              strokeWidth={highlightStage === 'evaporation' ? '4' : '2.5'}
              markerEnd="url(#wc-arrowhead-amber)"
              className="wc-flow-arrow"
              opacity={isStageEmphasized('evaporation') ? 0.95 : 0.25}
            />
            {/* Condensation / Cloud Drift arrow: Left Cloud -> Right Cloud */}
            <path
              d="M 332 104 Q 415 80 494 98"
              fill="none"
              stroke="#0284C7"
              strokeWidth={highlightStage === 'condensation' ? '4' : '2.5'}
              markerEnd="url(#wc-arrowhead-sky)"
              className="wc-flow-arrow"
              opacity={isStageEmphasized('condensation') ? 0.95 : 0.25}
            />
            {/* Precipitation arrow: Cloud -> Mountain/Land */}
            <path
              d="M 596 136 L 596 226"
              fill="none"
              stroke="#0284C7"
              strokeWidth={highlightStage === 'precipitation' ? '4' : '2.5'}
              markerEnd="url(#wc-arrowhead-sky)"
              className="wc-flow-arrow"
              opacity={isStageEmphasized('precipitation') ? 0.95 : 0.25}
            />
            {/* Collection arrow: River -> Ocean */}
            <path
              d="M 556 266 C 495 280, 442 294, 376 304"
              fill="none"
              stroke="#10B981"
              strokeWidth={highlightStage === 'collection' ? '4' : '2.5'}
              markerEnd="url(#wc-arrowhead-emerald)"
              className="wc-flow-arrow"
              opacity={isStageEmphasized('collection') ? 0.95 : 0.25}
            />
          </g>
        )}

        {/* FLOATING CLEAR LABELS */}
        {mode === 'mystery' ? (
          /* Chapter 1: Curiosity hotspots (don't spoil scientific terms immediately) */
          <g>
            {[
              { id: 'sun' as const, x: 115, y: 146, label: '1. Warm Sun' },
              { id: 'ocean' as const, x: 160, y: 344, label: '2. Ocean Water' },
              { id: 'clouds' as const, x: 564, y: 54, label: '3. Moving Clouds' },
              { id: 'river' as const, x: 505, y: 312, label: '4. Rivers & Land' },
            ].map((spot) => {
              const active = activeHotspot === spot.id;
              return (
                <g
                  key={spot.id}
                  transform={`translate(${spot.x}, ${spot.y})`}
                  className="cursor-pointer"
                  onClick={() => onSelectHotspot?.(spot.id)}
                >
                  <rect
                    x="-62"
                    y="-14"
                    width="124"
                    height="26"
                    rx="13"
                    fill={active ? '#0B2242' : '#FFFFFF'}
                    stroke={active ? '#F59E0B' : '#0284C7'}
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="700"
                    fill={active ? '#FFFFFF' : '#0F172A'}
                  >
                    {spot.label}
                  </text>
                </g>
              );
            })}
          </g>
        ) : (
          /* Scientific Stage Labels for Ch 2, Ch 3, Ch 4 */
          <g>
            {[
              {
                id: 'evaporation' as const,
                x: 175,
                y: 222,
                text: 'Evaporation',
                bg: '#FEF3C7',
                border: '#D97706',
                fg: '#92400E',
              },
              {
                id: 'condensation' as const,
                x: 346,
                y: 62,
                text: 'Condensation',
                bg: '#E0F2FE',
                border: '#0284C7',
                fg: '#075985',
              },
              {
                id: 'precipitation' as const,
                x: 632,
                y: 198,
                text:
                  precipitationForm === 'snow'
                    ? 'Precipitation (Snow)'
                    : precipitationForm === 'hail'
                    ? 'Precipitation (Hail)'
                    : 'Precipitation',
                bg: '#DBEAFE',
                border: '#1D4ED8',
                fg: '#1E3A8A',
              },
              {
                id: 'collection' as const,
                x: 472,
                y: 318,
                text: 'Collection',
                bg: '#D1FAE5',
                border: '#059669',
                fg: '#065F46',
              },
            ].map((lbl) => {
              const active = mode === 'stage' && highlightStage === lbl.id;
              const dimmed = mode === 'stage' && highlightStage && highlightStage !== lbl.id;
              const width = lbl.text.length * 7.2 + 24;
              return (
                <g
                  key={lbl.id}
                  transform={`translate(${lbl.x}, ${lbl.y})`}
                  opacity={dimmed ? 0.35 : 1}
                >
                  <rect
                    x={-width / 2}
                    y="-14"
                    width={width}
                    height="27"
                    rx="13.5"
                    fill={active ? lbl.border : lbl.bg}
                    stroke={lbl.border}
                    strokeWidth={active ? '2.5' : '1.5'}
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="700"
                    fill={active ? '#FFFFFF' : lbl.fg}
                  >
                    {lbl.text}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* MICROSCOPIC ZOOM-IN LENS OVERLAY (Chapter 2) */}
        {showMicroscopic && highlightStage && (
          <g data-testid="microscopic-zoom-lens" transform="translate(744, 86)">
            {/* Magnifying glass ring */}
            <circle cx="0" cy="0" r="70" fill="#0F172A" fillOpacity="0.93" stroke="#38BDF8" strokeWidth="4" />
            <circle cx="0" cy="0" r="63" fill="none" stroke="#7DD3FC" strokeWidth="1" strokeDasharray="4 4" />
            <text
              x="0"
              y="-41"
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill="#7DD3FC"
            >
              MICROSCOPIC ZOOM
            </text>

            {highlightStage === 'evaporation' && (
              <g>
                {/* Liquid surface at bottom of lens */}
                <path d="M -54 24 Q 0 18 54 24 L 46 46 Q 0 60 -46 46 Z" fill="#0284C7" opacity="0.85" />
                {/* Escaping spaced-out vapour molecules */}
                {[
                  { x: -24, y: 4, d: '0s' },
                  { x: 6, y: -12, d: '0.3s' },
                  { x: 26, y: 8, d: '0.6s' },
                  { x: -6, y: -26, d: '0.9s' },
                ].map((m, i) => (
                  <g key={i} className="wc-molecule" style={{ animationDelay: m.d }}>
                    <circle cx={m.x} cy={m.y} r="5.5" fill="#FDE047" />
                    <circle cx={m.x - 5} cy={m.y + 4} r="3" fill="#E0F2FE" />
                    <circle cx={m.x + 5} cy={m.y + 4} r="3" fill="#E0F2FE" />
                  </g>
                ))}
                <text x="0" y="54" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#FEF08A">
                  Heat → Gas rises
                </text>
              </g>
            )}

            {highlightStage === 'condensation' && (
              <g>
                {/* Dust speck + cooling vapour clustering into liquid droplet */}
                <circle cx="0" cy="2" r="24" fill="#38BDF8" fillOpacity="0.25" stroke="#7DD3FC" strokeWidth="1.5" />
                <circle cx="0" cy="2" r="4" fill="#94A3B8" />
                {[
                  { x: -12, y: -8 },
                  { x: 12, y: -6 },
                  { x: -10, y: 12 },
                  { x: 11, y: 11 },
                  { x: 0, y: -14 },
                  { x: 0, y: 16 },
                ].map((m, i) => (
                  <circle
                    key={i}
                    cx={m.x}
                    cy={m.y}
                    r="5"
                    fill="#7DD3FC"
                    className="wc-molecule"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
                <text x="0" y="50" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#BAE6FD">
                  Cool air → Droplets
                </text>
              </g>
            )}

            {highlightStage === 'precipitation' && (
              <g>
                {/* Tiny droplets merging into one heavy falling drop */}
                <circle cx="-26" cy="-16" r="5" fill="#7DD3FC" />
                <circle cx="24" cy="-14" r="5" fill="#7DD3FC" />
                <path
                  d="M 0 -22 C 14 -2 22 10 22 20 A 22 22 0 1 1 -22 20 C -22 10 -14 -2 0 -22 Z"
                  fill="#0EA5E9"
                  stroke="#BAE6FD"
                  strokeWidth="2"
                />
                <text x="0" y="56" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#BAE6FD">
                  Heavy drop falls
                </text>
              </g>
            )}

            {highlightStage === 'collection' && (
              <g>
                {/* Soil grains with water trickling between them */}
                <circle cx="-24" cy="-6" r="11" fill="#A16207" />
                <circle cx="20" cy="-10" r="12" fill="#92400E" />
                <circle cx="-10" cy="22" r="11" fill="#78350F" />
                <circle cx="24" cy="20" r="10" fill="#A16207" />
                <path
                  d="M -2 -32 C -2 -8, 6 2, 4 38"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <text x="0" y="55" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6EE7B7">
                  Flows &amp; seeps in
                </text>
              </g>
            )}
          </g>
        )}
      </svg>

      {/* PAUSED OVERLAY CHIP */}
      {paused && (
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-bold text-amber-300 shadow-md">
          <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
          <span>Animation Paused</span>
        </div>
      )}
    </div>
  );
};

export const RealWorldScenarioVisual: React.FC<{
  visualType: 'puddle' | 'cold-glass' | 'dark-clouds';
}> = ({ visualType }) => {
  if (visualType === 'puddle') {
    return (
      <svg
        viewBox="0 0 260 130"
        className="w-full h-32 rounded-xl border border-amber-200/80 bg-gradient-to-b from-sky-200 to-sky-50"
        role="img"
        aria-label="Animated sunny playground puddle disappearing as water vapour rises"
      >
        {/* Bright sun */}
        <circle cx="222" cy="28" r="18" fill="#FACC15" stroke="#FEF08A" strokeWidth="3" />
        {/* Playground ground */}
        <rect x="0" y="88" width="260" height="42" fill="#CBD5E1" />
        {/* Shrinking puddle */}
        <ellipse cx="122" cy="108" rx="66" ry="12" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        {/* Rising invisible-to-student vapour waves */}
        {[85, 118, 152].map((x, i) => (
          <path
            key={x}
            d={`M ${x} 98 Q ${x - 6} 82 ${x} 66 Q ${x + 6} 50 ${x} 38`}
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="wc-vapour"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </svg>
    );
  }

  if (visualType === 'cold-glass') {
    return (
      <svg
        viewBox="0 0 260 130"
        className="w-full h-32 rounded-xl border border-sky-200/80 bg-gradient-to-b from-amber-50 to-orange-50/70"
        role="img"
        aria-label="Animated cold glass of lemonade with tiny water droplets forming on the outside"
      >
        {/* Table */}
        <rect x="0" y="106" width="260" height="24" fill="#D6D3D1" />
        {/* Glass outline */}
        <path d="M 96 24 L 106 106 L 154 106 L 164 24 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
        {/* Lemonade inside */}
        <path d="M 101 44 L 108 103 L 152 103 L 159 44 Z" fill="#FEF08A" />
        {/* Ice cubes */}
        <rect x="112" y="48" width="16" height="14" rx="3" fill="#FFFFFF" opacity="0.85" transform="rotate(-8 120 55)" />
        <rect x="132" y="52" width="16" height="14" rx="3" fill="#FFFFFF" opacity="0.85" transform="rotate(10 140 59)" />
        {/* Sparkling outside condensation droplets */}
        {[
          { x: 98, y: 54 },
          { x: 101, y: 74 },
          { x: 104, y: 90 },
          { x: 161, y: 58 },
          { x: 158, y: 78 },
          { x: 155, y: 94 },
        ].map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r="3.6"
            fill="#0EA5E9"
            stroke="#FFFFFF"
            strokeWidth="1"
            className="wc-molecule"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
        {/* Warm air vapour arrows touching glass */}
        <path d="M 52 62 Q 72 60 88 64" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
        <path d="M 208 62 Q 188 60 172 64" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
        <text x="44" y="50" fontSize="9.5" fontWeight="700" fill="#B45309">
          Warm Air
        </text>
        <text x="176" y="50" fontSize="9.5" fontWeight="700" fill="#B45309">
          Warm Air
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 130"
      className="w-full h-32 rounded-xl border border-slate-300 bg-gradient-to-b from-slate-500 to-slate-300"
      role="img"
      aria-label="Animated dark storm clouds releasing raindrops onto rooftops"
    >
      {/* Dark heavy cloud */}
      <g className="wc-cloud">
        <ellipse cx="130" cy="36" rx="74" ry="20" fill="#334155" />
        <circle cx="94" cy="28" r="22" fill="#475569" />
        <circle cx="130" cy="22" r="26" fill="#334155" />
        <circle cx="166" cy="28" r="21" fill="#475569" />
      </g>
      {/* Animated rain */}
      {[82, 102, 122, 142, 162, 180].map((x, i) => (
        <line
          key={x}
          x1={x}
          y1="56"
          x2={x - 5}
          y2="72"
          stroke="#E0F2FE"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="wc-rain"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
      {/* Rooftop silhouette */}
      <polygon points="78,130 130,96 182,130" fill="#7C2D12" />
    </svg>
  );
};
