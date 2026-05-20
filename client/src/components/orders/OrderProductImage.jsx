import React, { useState, useCallback, memo } from 'react';
import { Scissors } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the primary image URL from a garment document.
 * Priority: referenceImages → customerImages → customerClothImages
 */
function getPrimaryImage(garment) {
  if (!garment) return null;
  const first = (arr) => Array.isArray(arr) && arr.length > 0 ? arr[0]?.url : null;
  return (
    first(garment.referenceImages) ||
    first(garment.customerImages) ||
    first(garment.customerClothImages) ||
    null
  );
}

// ─── ProductImageFallback ─────────────────────────────────────────────────────

export const ProductImageFallback = memo(({ size = 52, garmentName }) => (
  <div
    title={garmentName || 'No image'}
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)',
      border: '1.5px solid #c7d2fe',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      flexShrink: 0,
    }}
  >
    <Scissors size={size > 44 ? 18 : 13} color="#6366f1" strokeWidth={1.8} />
    {size > 44 && (
      <span style={{ fontSize: 8, color: '#6366f1', fontWeight: 600, letterSpacing: 0.3 }}>
        NO IMG
      </span>
    )}
  </div>
));
ProductImageFallback.displayName = 'ProductImageFallback';

// ─── HoverPreviewCard ─────────────────────────────────────────────────────────

const HoverPreviewCard = memo(({ garments, orderId, visible }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '110%',
        left: 0,
        zIndex: 999,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        boxShadow: '0 16px 48px rgba(0,0,0,0.16)',
        padding: 12,
        minWidth: 220,
        pointerEvents: 'none',
        animation: 'fadeInUp 0.15s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em', marginBottom: 8, textTransform: 'uppercase' }}>
        Order #{orderId} · {garments.length} garment{garments.length !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {garments.slice(0, 3).map((g, i) => {
          const img = getPrimaryImage(g);
          return (
            <div key={g._id || i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {img ? (
                <img
                  src={img}
                  alt={g.name}
                  loading="lazy"
                  style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #f3f4f6', flexShrink: 0 }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <ProductImageFallback size={40} garmentName={g.name} />
              )}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{g.name || `Garment ${i + 1}`}</div>
                {g.itemName && <div style={{ fontSize: 10, color: '#9ca3af' }}>{g.itemName}</div>}
              </div>
            </div>
          );
        })}
        {garments.length > 3 && (
          <div style={{ fontSize: 11, color: '#6b7280', paddingLeft: 4 }}>
            +{garments.length - 3} more garment{garments.length - 3 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
});
HoverPreviewCard.displayName = 'HoverPreviewCard';

// ─── OrderProductImage ────────────────────────────────────────────────────────

/**
 * Main export — displays stacked thumbnails for garments in an order row.
 * Props:
 *   garments  — array of populated Garment documents
 *   orderId   — for the hover preview label
 *   size      — thumbnail px (default 52)
 */
const OrderProductImage = memo(({ garments = [], orderId, size = 52 }) => {
  const [hovered, setHovered] = useState(false);

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => setHovered(false), []);

  if (!garments.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ProductImageFallback size={size} garmentName="No garments" />
      </div>
    );
  }

  const firstGarment = garments[0];
  const primaryImg = getPrimaryImage(firstGarment);
  const extra = garments.length - 1;

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Main thumbnail */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {primaryImg ? (
          <img
            src={primaryImg}
            alt={firstGarment.name || 'Garment'}
            loading="lazy"
            style={{
              width: size,
              height: size,
              borderRadius: 12,
              objectFit: 'cover',
              border: '2px solid #e0e7ff',
              boxShadow: '0 2px 8px rgba(99,102,241,0.12)',
              display: 'block',
              transition: 'transform 0.2s, box-shadow 0.2s',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex');
            }}
          />
        ) : (
          <ProductImageFallback size={size} garmentName={firstGarment.name} />
        )}

        {/* +N badge for multiple garments */}
        {extra > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: '#2563eb',
              color: '#fff',
              borderRadius: 20,
              fontSize: 9,
              fontWeight: 800,
              padding: '2px 5px',
              border: '2px solid #fff',
              lineHeight: 1.2,
              minWidth: 18,
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(37,99,235,0.3)',
            }}
          >
            +{extra}
          </div>
        )}
      </div>

      {/* Garment name (compact) */}
      <div style={{ maxWidth: 80 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: '#374151',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: 80,
        }}>
          {firstGarment.name || 'Garment'}
        </div>
        {garments.length > 1 && (
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            +{extra} more
          </div>
        )}
      </div>

      {/* Hover preview card */}
      <HoverPreviewCard garments={garments} orderId={orderId} visible={hovered} />
    </div>
  );
});
OrderProductImage.displayName = 'OrderProductImage';

export default OrderProductImage;
