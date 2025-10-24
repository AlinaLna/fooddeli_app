import React from 'react';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OngoingOrderCard = ({ order, cardMargin }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        marginBottom: cardMargin,
        boxShadow: '0 0.125rem 1rem rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Order Header */}
      <div style={{
        padding: '1.25rem',
        borderBottom: '0.0625rem solid #f5f5f5'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#333',
              marginBottom: '0.25rem'
            }}>
              {order.restaurant}
            </h3>
            <div style={{
              fontSize: '1.125rem',
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <MapPin size={14} strokeWidth={2} />
              {order.restaurantAddress}
            </div>
          </div>
          <div style={{
            background: order.status === 'Đang giao hàng' ? '#fff7ed' : '#f0fdf4',
            color: order.status === 'Đang giao hàng' ? '#ea580c' : '#16a34a',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '1.375rem',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            marginLeft: '0.75rem'
          }}>
            {order.status}
          </div>
        </div>
        <div style={{
          fontSize: '1.125rem',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Clock size={14} strokeWidth={2} />
          Dự kiến {order.estimatedTime}
        </div>
      </div>

      {/* Order Items */}
      <div style={{
        padding: '1.25rem',
        borderBottom: '0.0625rem solid #f5f5f5'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '6.5rem',
            height: '6.5rem',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            flexShrink: 0
          }}>
          </div>
          <div style={{ flex: 1 }}>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '1.375rem',
                  color: '#666',
                  marginBottom: idx < order.items.length - 1 ? '0.25rem' : 0
                }}
              >
                {item.quantity}x {item.name}
              </div>
            ))}
            <div style={{
              fontSize: '1.375rem',
              fontWeight: '700',
              color: '#ee4d2d',
              marginTop: '0.5rem'
            }}>
              {formatPrice(order.total)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '1.25rem' }}>
        <button
          onClick={() => navigate('/customer/order-tracking')}
          style={{
            width: '100%',
            padding: '1.125rem',
            background: 'linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)',
            border: 'none',
            borderRadius: '0.75rem',
            color: '#fff',
            fontSize: '1.375rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 0.25rem 0.75rem rgba(238, 77, 45, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-0.125rem)';
            e.currentTarget.style.boxShadow = '0 0.375rem 1rem rgba(238, 77, 45, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(238, 77, 45, 0.3)';
          }}
        >
          Theo dõi đơn hàng
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default OngoingOrderCard;