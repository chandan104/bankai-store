import React, { useState } from 'react';
import { Settings, Phone, Bell, Lock, Download, RefreshCw, Check, AlertCircle, Shield } from 'lucide-react';
import { StoreSettings as IStoreSettings, Product } from '../types';

interface StoreSettingsProps {
  settings: IStoreSettings;
  products: Product[];
  onUpdateSettings: (newSettings: IStoreSettings) => void;
  onResetStore: () => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  settings,
  products,
  onUpdateSettings,
  onResetStore,
}) => {
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload: any = {
      whatsappNumber: whatsappNumber.trim(),
      announcement: announcement.trim(),
      storeName: storeName.trim(),
    };

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        setLoading(false);
        return;
      }
      payload.adminPassword = newPassword;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateSettings(data.settings);
        setMessage({ type: 'success', text: 'Store settings updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server communication error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bankai_store_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <form onSubmit={handleSaveSettings} className="bg-card/70 border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/60">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Store Configuration & General Settings</h3>
            <p className="text-xs text-muted-foreground">
              Configure store branding, WhatsApp order destination, and security
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                : 'bg-destructive/10 text-destructive border border-destructive/30'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Orders Phone Number</span>
            </label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 918413958014 (Country code + phone)"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Include country code without + or spaces (e.g. 918413958014)
            </p>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>

        {/* Announcement Bar */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-primary" />
            <span>Top Announcement Bar Message</span>
          </label>
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Banner announcement message..."
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
          />
        </div>

        {/* Change Admin Password */}
        <div className="pt-4 border-t border-border/40">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>Change Admin Password</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="New password (leave blank to keep current)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Backup and Maintenance Actions */}
      <div className="bg-card/70 border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
        <h4 className="text-base font-bold text-white">Database Backup & Disaster Recovery</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/40 text-left transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                Export Products Backup
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download all {products.length} products as JSON file
              </p>
            </div>
            <Download className="w-5 h-5 text-primary" />
          </button>

          <button
            type="button"
            onClick={onResetStore}
            className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 hover:bg-red-950/30 text-left transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-bold text-sm text-red-300">Reset Store to Default</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Restore default 50 anime products
              </p>
            </div>
            <RefreshCw className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
