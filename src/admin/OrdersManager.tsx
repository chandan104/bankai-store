import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, Truck, XCircle, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { OrderInquiry, StoreSettings } from '../types';

interface OrdersManagerProps {
  settings: StoreSettings;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ settings }) => {
  const [orders, setOrders] = useState<OrderInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: OrderInquiry['status']) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map((o) => (o.id === id ? data.order : o)));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order inquiry?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.filter((o) => o.id !== id));
      }
    } catch (err) {
      alert('Failed to delete inquiry');
    }
  };

  const filtered = orders.filter((o) => {
    if (filterStatus === 'All') return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OrderInquiry['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-950/70 text-blue-400 border-blue-800';
      case 'Contacted':
        return 'bg-amber-950/70 text-amber-400 border-amber-800';
      case 'Confirmed':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800';
      case 'Shipped':
        return 'bg-purple-950/70 text-purple-400 border-purple-800';
      case 'Delivered':
        return 'bg-green-950/70 text-green-300 border-green-800';
      case 'Cancelled':
        return 'bg-red-950/70 text-red-400 border-red-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/70 border border-border/80 p-4 md:p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">WhatsApp Orders & Leads CRM</h3>
            <p className="text-xs text-muted-foreground">
              Automatically captures customer product inquiries when they click Order on WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
          >
            <option value="All">All Statuses ({orders.length})</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-white"
            title="Refresh inquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card/70 border border-border/80 rounded-2xl overflow-hidden shadow-lg">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h4 className="text-base font-bold text-white mb-1">No order inquiries found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When customers on your website click "Order on WhatsApp" on any collectible, their inquiry will automatically appear here!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-primary">{ord.id}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {ord.productImage && (
                          <img
                            src={ord.productImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-muted/40 flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-white line-clamp-1 max-w-[220px] md:max-w-xs">
                            {ord.productName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {ord.customerName || 'WhatsApp Shopper'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-white">
                      {settings.currency}{ord.productPrice.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${getStatusBadge(ord.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const text = encodeURIComponent(
                              `Hello! Thank you for inquiring about ${ord.productName} (${settings.currency}${ord.productPrice}) at Bankai Store.`
                            );
                            window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
                          }}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/20"
                          title="Open WhatsApp chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(ord.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
