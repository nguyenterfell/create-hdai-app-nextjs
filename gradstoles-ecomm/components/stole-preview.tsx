'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getColorHex } from '@/lib/colors';

const POINTED_VIEWBOX = '0 0 1024 1536';
const POINTED_PATHS = [
  'M378.96,229.52l71.89-45.75s-17.36,26.25-22.76,232.74c1.39,73.7,5.72,183.29,9.08,254.31l-38.93,45.84-46.37-49.16,3.85-224.04s1.54-98.55,3.85-126.26,4.01-74.94,19.39-87.68Z',
  'M565.22,184.31l69.35,41.83s17.33,8.5,21.45,132.5c3.45,156.22-.52,182.35,2.42,309.94-20.13,23.11-44.17,47.7-44.17,47.7l-41.6-44.55s6.06-150.56,10.05-296.87c-6.33-195.02-17.5-190.55-17.5-190.55Z',
] as const;

interface StolePreviewProps {
  stoleType: string;
  length: string;
  style: string;
  mainColor: string;
  secondaryColor: string;
  trimWidth: string;
  upperColor: string;
  lowerColor: string;
  finish: string;
}

export function StolePreview({
  stoleType,
  length,
  style,
  mainColor,
  secondaryColor,
  trimWidth,
  upperColor,
  lowerColor,
  finish,
}: StolePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const baseGradientId = useId().replace(/:/g, '');
  // Determine colors based on style
  const displayColors = useMemo(() => {
    if (style === 'solid') {
      const mainHex = mainColor ? getColorHex(mainColor) : '#ef4444';
      return { upper: mainHex, lower: mainHex };
    } else if (style === 'trim') {
      const mainHex = mainColor ? getColorHex(mainColor) : '#ef4444';
      const trimHex = secondaryColor ? getColorHex(secondaryColor) : '#e5e7eb';
      return { upper: mainHex, lower: mainHex, trim: trimHex };
    } else if (style === 'split') {
      const upperHex = upperColor ? getColorHex(upperColor) : '#ef4444';
      const lowerHex = lowerColor || upperColor ? getColorHex(lowerColor || upperColor) : '#e5e7eb';
      return { upper: upperHex, lower: lowerHex };
    }
    return { upper: '#e5e7eb', lower: '#e5e7eb' };
  }, [style, mainColor, secondaryColor, upperColor, lowerColor]);

  const upperColorHex = displayColors.upper;
  const lowerColorHex = displayColors.lower;
  const trimStrokeWidth =
    style === 'trim' && displayColors.trim
      ? Math.max((parseFloat(trimWidth) || 0) * 6, 2)
      : undefined;

  const stoleWidth = useMemo(() => {
    switch (stoleType) {
      case 'standard':
        return 4;
      case 'luxury':
        return 4.5;
      case 'deluxe':
        return 5;
      default:
        return 4.5;
    }
  }, [stoleType]);

  const lengthValue = parseInt(length) || 66;
  const widthPx = stoleWidth * 16;
  const heightPx = lengthValue * 2.5;
  const showPhotorealPreview = finish === 'classic-pointed';

  const colorInfoSection = (
    <div className="mt-8 text-center space-y-3">
      {style === 'solid' && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <div
            className="w-8 h-8 rounded border-2 shadow-sm"
            style={{ backgroundColor: upperColorHex }}
          />
          <span className="text-muted-foreground font-medium">
            Color:{' '}
            <span className="text-foreground">
              {mainColor ? mainColor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
            </span>
          </span>
        </div>
      )}
      {style === 'trim' && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 shadow-sm"
              style={{ backgroundColor: upperColorHex }}
            />
            <span className="text-muted-foreground font-medium">
              Main:{' '}
              <span className="text-foreground">
                {mainColor ? mainColor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 shadow-sm"
              style={{ backgroundColor: displayColors.trim || '#e5e7eb' }}
            />
            <span className="text-muted-foreground font-medium">
              Trim:{' '}
              <span className="text-foreground">
                {secondaryColor ? secondaryColor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
              </span>{' '}
              ({trimWidth}")
            </span>
          </div>
        </div>
      )}
      {style === 'split' && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 shadow-sm"
              style={{ backgroundColor: upperColorHex }}
            />
            <span className="text-muted-foreground font-medium">
              Upper:{' '}
              <span className="text-foreground">
                {upperColor ? upperColor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 shadow-sm"
              style={{ backgroundColor: lowerColorHex }}
            />
            <span className="text-muted-foreground font-medium">
              Lower:{' '}
              <span className="text-foreground">
                {lowerColor || upperColor ? (lowerColor || upperColor).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
              </span>
            </span>
          </div>
        </div>
      )}
      {style === 'custom' && (
        <p className="text-sm text-muted-foreground">Custom style - contact us for details</p>
      )}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{stoleWidth}"</span> width ×{' '}
        <span className="font-semibold text-foreground">{length}"</span> length
        {finish && (
          <>
            {' '}
            •{' '}
            <span className="font-semibold text-foreground">
              {finish.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </>
        )}
      </p>
    </div>
  );

  const legacyPreview = (
    <div className="relative mx-auto" style={{ width: '240px', height: '480px' }}>
      {/* Head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 border-2 border-gray-400 shadow-sm" />

      {/* Shoulders */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-44 h-10 bg-gradient-to-b from-gray-150 to-gray-250 rounded-full shadow-sm" />

      {/* Body/Torso */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-36 h-56 bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-3xl shadow-sm" />

      {/* Stole - positioned over shoulders */}
      <div
        className="absolute rounded-sm shadow-xl"
        style={{
          top: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          background:
            style === 'trim'
              ? upperColorHex
              : `linear-gradient(to bottom, ${upperColorHex} 0%, ${upperColorHex} 50%, ${lowerColorHex} 50%, ${lowerColorHex} 100%)`,
          border: '2px solid rgba(0,0,0,0.1)',
          zIndex: 10,
          boxShadow:
            style === 'trim' && displayColors.trim
              ? `inset 0 0 0 ${parseFloat(trimWidth) * 4}px ${displayColors.trim}`
              : undefined,
        }}
      >
        {/* Stole ends - based on finish */}
        {finish === 'classic-pointed' || finish === 'angled' ? (
          finish === 'classic-pointed' ? (
            // Arrow points
            <div className="absolute bottom-0 left-0 w-full h-8 flex justify-between px-3">
              <div
                className="w-0 h-0"
                style={{
                  borderRight: `18px solid ${lowerColorHex}`,
                  borderTop: '28px solid transparent',
                  borderBottom: '28px solid transparent',
                }}
              />
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: `18px solid ${lowerColorHex}`,
                  borderTop: '28px solid transparent',
                  borderBottom: '28px solid transparent',
                }}
              />
            </div>
          ) : (
            // Angled
            <div className="absolute bottom-0 left-0 w-full h-6">
              <div
                className="absolute bottom-0 left-0 w-full h-0"
                style={{
                  borderLeft: `${widthPx / 2}px solid transparent`,
                  borderRight: `${widthPx / 2}px solid transparent`,
                  borderTop: `24px solid ${lowerColorHex}`,
                }}
              />
            </div>
          )
        ) : (
          // Horizontal Cut
          <div className="absolute bottom-0 left-0 w-full h-2 bg-border" />
        )}
      </div>
    </div>
  );

  const handleOpenZoom = () => {
    setIsZoomed(true);
  };
  const handleCloseZoom = () => setIsZoomed(false);

  useEffect(() => {
    if (!isZoomed) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isZoomed]);

  const renderLegacyPreview = (mode: 'default' | 'zoomed') => {
    const scale = mode === 'zoomed' ? 1.35 : 1;
    const baseWidth = 240 * scale;
    const baseHeight = 480 * scale;
    return (
      <div className="relative mx-auto" style={{ width: `${baseWidth}px`, height: `${baseHeight}px` }}>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 border-2 border-gray-400 shadow-sm"
            style={{ width: `${112 * scale}px`, height: `${112 * scale}px` }}
          />
        <div
          className="absolute bg-gradient-to-b from-gray-150 to-gray-250 rounded-full shadow-sm"
          style={{
            top: `${96 * scale}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${176 * scale}px`,
            height: `${40 * scale}px`,
          }}
        />
        <div
          className="absolute bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-3xl shadow-sm"
          style={{
            top: `${112 * scale}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${144 * scale}px`,
            height: `${224 * scale}px`,
          }}
        />
        <div
          className="absolute rounded-sm shadow-xl"
          style={{
            top: `${112 * scale}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${widthPx * scale}px`,
            height: `${heightPx * scale}px`,
            background:
              style === 'trim'
                ? upperColorHex
                : `linear-gradient(to bottom, ${upperColorHex} 0%, ${upperColorHex} 50%, ${lowerColorHex} 50%, ${lowerColorHex} 100%)`,
            border: '2px solid rgba(0,0,0,0.1)',
            zIndex: 10,
            boxShadow:
              style === 'trim' && displayColors.trim
                ? `inset 0 0 0 ${parseFloat(trimWidth) * 4 * scale}px ${displayColors.trim}`
                : undefined,
          }}
        >
          {finish === 'classic-pointed' || finish === 'angled' ? (
            finish === 'classic-pointed' ? (
              <div className="absolute bottom-0 left-0 w-full h-8 flex justify-between px-3" style={{ height: `${32 * scale}px` }}>
                <div
                  className="w-0 h-0"
                  style={{
                    borderRight: `${18 * scale}px solid ${lowerColorHex}`,
                    borderTop: `${28 * scale}px solid transparent`,
                    borderBottom: `${28 * scale}px solid transparent`,
                  }}
                />
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: `${18 * scale}px solid ${lowerColorHex}`,
                    borderTop: `${28 * scale}px solid transparent`,
                    borderBottom: `${28 * scale}px solid transparent`,
                  }}
                />
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 w-full h-6" style={{ height: `${24 * scale}px` }}>
                <div
                  className="absolute bottom-0 left-0 w-full h-0"
                  style={{
                    borderLeft: `${(widthPx / 2) * scale}px solid transparent`,
                    borderRight: `${(widthPx / 2) * scale}px solid transparent`,
                    borderTop: `${24 * scale}px solid ${lowerColorHex}`,
                  }}
                />
              </div>
            )
          ) : (
            <div className="absolute bottom-0 left-0 bg-border" style={{ width: '100%', height: `${8 * scale}px` }} />
          )}
        </div>
      </div>
    );
  };

  const renderPhotorealPreview = (mode: 'default' | 'zoomed') => {
    const gradientId = `${baseGradientId}-${mode}`;
    const pointedFill = style === 'split' ? `url(#${gradientId})` : upperColorHex;
    return (
      <div className={mode === 'zoomed' ? 'relative w-full max-w-3xl mx-auto' : 'relative w-full'}>
        <Image
          src="/images/GradMannequin2.png"
          alt="Graduation mannequin"
          width={1024}
          height={1536}
          className={`w-full h-auto rounded-md ${mode === 'zoomed' ? 'shadow-2xl' : ''}`}
          priority={mode === 'default'}
        />
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={POINTED_VIEWBOX}
          role="presentation"
        >
          <defs>
            {style === 'split' && (
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1536" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={upperColorHex} />
                <stop offset="48%" stopColor={upperColorHex} />
                <stop offset="52%" stopColor={lowerColorHex} />
                <stop offset="100%" stopColor={lowerColorHex} />
              </linearGradient>
            )}
          </defs>
          <g fillRule="evenodd" clipRule="evenodd">
            {POINTED_PATHS.map((d, index) => (
              <g key={`pointed-${index}`}>
                <path
                  d={d}
                  fill={pointedFill}
                  stroke="rgba(15,23,42,0.12)"
                  strokeWidth={1.2}
                  strokeLinejoin="round"
                />
                {style === 'trim' && displayColors.trim && (
                  <path
                    d={d}
                    fill="none"
                    stroke={displayColors.trim}
                    strokeWidth={trimStrokeWidth}
                    strokeLinejoin="round"
                  />
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
    );
  };

  const renderPreview = (mode: 'default' | 'zoomed') =>
    showPhotorealPreview ? renderPhotorealPreview(mode) : renderLegacyPreview(mode);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>See how your stole will look on a model</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-muted/30 to-background">
        <button
          type="button"
          onClick={handleOpenZoom}
          className="group relative w-full max-w-md focus:outline-none"
          aria-label="Open stole preview in larger view"
        >
          <span className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
            Click to zoom
          </span>
          {renderPreview('default')}
        </button>
        {colorInfoSection}
        {isZoomed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed stole preview"
            onClick={handleCloseZoom}
          >
            <div
              className="relative w-full max-w-5xl rounded-lg bg-background shadow-2xl focus:outline-none"
              style={{ maxHeight: 'calc(100vh - 2rem)' }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCloseZoom}
                className="absolute right-4 top-4 z-10 rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-muted/80 hover:text-foreground focus:outline-none focus-visible:ring focus-visible:ring-primary/50"
                aria-label="Close zoomed preview"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="max-h-[calc(100vh-4rem)] overflow-auto p-4 sm:p-8 space-y-6">
                {renderPreview('zoomed')}
                {colorInfoSection}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
