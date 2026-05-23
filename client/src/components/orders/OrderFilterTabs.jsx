import React, { useMemo } from 'react';

const TABS = [
  { key: 'all',               label: 'All Orders'       },
  { key: 'draft',             label: 'New'              },
  { key: 'confirmed',         label: 'Confirmed'        },
  { key: 'in-progress',       label: 'In Progress'      },
  { key: 'cutting',           label: 'Cutting'          },
  { key: 'stitching',         label: 'Stitching'        },
  { key: 'trial',             label: 'Trial'            },
  { key: 'ready-to-delivery', label: 'Ready'            },
  { key: 'delivered',         label: 'Delivered'        },
  { key: 'cancelled',         label: 'Cancelled'        },
  { key: '__overdue',         label: 'Overdue'          },
];

export default function OrderFilterTabs({ stats, activeTab, onTabChange }) {
  const counts = useMemo(() => {
    if (!stats) return { all: 0, __overdue: 0 };
    return {
      all: stats.total || stats.totalOrders || 0,
      draft: stats.draft || 0,
      confirmed: stats.confirmed || 0,
      'in-progress': stats['in-progress'] || 0,
      cutting: stats.cutting || 0,
      stitching: stats.stitching || 0,
      trial: stats.trial || 0,
      'ready-to-delivery': stats['ready-to-delivery'] || stats.ready || 0,
      delivered: stats.delivered || 0,
      cancelled: stats.cancelled || 0,
      __overdue: stats.overdue || 0
    };
  }, [stats]);

  return (
    <div style={{
      display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4,
      scrollbarWidth: 'none', msOverflowStyle: 'none', marginBottom: 16,
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        const count = counts[tab.key] || 0;
        const isOverdue = tab.key === '__overdue';

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, whiteSpace: 'nowrap',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: isActive
                ? (isOverdue ? '#dc2626' : '#2563eb')
                : '#fff',
              color: isActive ? '#fff' : '#4b5563',
              boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
              outline: isActive ? 'none' : '1px solid #e5e7eb',
            }}
          >
            {tab.label}
            {count > 0 && (
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : (isOverdue && count > 0 ? '#fef2f2' : '#eff6ff'),
                color: isActive ? '#fff' : (isOverdue && count > 0 ? '#dc2626' : '#2563eb'),
                borderRadius: 20, fontSize: 11, fontWeight: 700,
                padding: '1px 7px', minWidth: 20, textAlign: 'center',
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
