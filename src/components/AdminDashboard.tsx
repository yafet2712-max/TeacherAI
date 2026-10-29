import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, Clock, Trash2, Key, Phone, ExternalLink, X, AlertTriangle } from 'lucide-react';

export interface SubscriptionRequest {
  id: string;
  phoneNumber: string;
  featureKey: string;
  serviceTitle: string;
  transactionId: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: number;
  expiresAt?: number;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (requestId: string, status: 'approved' | 'rejected' | 'pending') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onUpdateStatus }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const loadRequests = () => {
    try {
      const data = localStorage.getItem('teacher_helper_subscription_requests_v1');
      if (data) {
        setRequests(JSON.parse(data));
      } else {
        setRequests([]);
      }
    } catch {
      setRequests([]);
    }
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin PIN: zena1221, 1234, or phone suffix 3882
    if (pin === 'zena1221' || pin === '1234' || pin === '3882' || pin === '2017') {
      setIsAuthenticated(true);
      setError(null);
      loadRequests();
    } else {
      setError('የአስተዳዳሪ የሚስጥር ቃል (Password) ስህተት ነው (Incorrect Password).');
    }
  };

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const updated = requests.map((req) => {
        if (req.id === id) {
          const now = Date.now();
          return {
            ...req,
            status: newStatus,
            approvedAt: newStatus === 'approved' ? now : req.approvedAt,
            expiresAt: newStatus === 'approved' ? now + 30 * 24 * 60 * 60 * 1000 : req.expiresAt,
          };
        }
        return req;
      });
      localStorage.setItem('teacher_helper_subscription_requests_v1', JSON.stringify(updated));
      setRequests(updated);
      onUpdateStatus(id, newStatus);
    } catch (e) {
      console.warn('Failed to update status', e);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('ይህን ጥያቄ መሰረዝ ይፈልጋሉ?')) {
      const filtered = requests.filter((r) => r.id !== id);
      localStorage.setItem('teacher_helper_subscription_requests_v1', JSON.stringify(filtered));
      setRequests(filtered);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'approved') return r.status === 'approved';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xl shadow">
              👑
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                Admin Control Dashboard (zenayafet)
              </span>
              <h2 className="text-xl font-black">የባለቤት አስተዳዳሪ መቆጣጠሪያ (Payment Approvals)</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto w-full my-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-inner">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-stone-900">የአስተዳዳሪ መግቢያ (Admin Login)</h3>
              <p className="text-xs text-stone-500">
                ለባለቤቱ (ዜናነህ ፀጋዬ) ብቻ የተዘጋጀ። እባክዎ የደህንነት ፒን ቁጥር ያስገቡ (Default PIN: 1234)።
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Admin PIN Code
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (e.g. 1234)"
                  className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl transition shadow-lg text-sm"
              >
                ግባ (Login to Dashboard)
              </button>
            </form>

            <div className="text-center text-xs text-stone-400">
              Telegram Contact: <a href="https://t.me/zenayafet" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline">@zenayafet</a>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Filter Tabs & Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-100 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                    filter === 'pending'
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-white text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  ⏳ የሚጠበቁ (Pending: {requests.filter((r) => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilter('approved')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                    filter === 'approved'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-white text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  ✅ የጸደቁ (Approved: {requests.filter((r) => r.status === 'approved').length})
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                    filter === 'all'
                      ? 'bg-stone-800 text-white shadow'
                      : 'bg-white text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  📁 ሁሉም (All: {requests.length})
                </button>
              </div>

              <div className="text-xs text-stone-600 font-medium flex items-center gap-2">
                <span>የቴሌግራም ማረጋገጫ:</span>
                <a
                  href="https://t.me/zenayafet"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                >
                  <span>@zenayafet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16 text-stone-400 space-y-2">
                <Clock className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-sm font-semibold">ምንም የክፍያ ጥያቄ አልተገኘም (No requests found)</p>
                <p className="text-xs">ተጠቃሚዎች የክፍያ ማረጋገጫ ሲልኩ እዚህ ይታያሉ።</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => {
                  const isExpired = req.expiresAt ? Date.now() > req.expiresAt : false;
                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        req.status === 'approved'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-amber-50/40 border-amber-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-stone-900">{req.serviceTitle}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                              req.status === 'approved'
                                ? 'bg-emerald-600 text-white'
                                : req.status === 'rejected'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {req.status}
                          </span>
                          {isExpired && (
                            <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                              Expired (ጊዜው አልቋል)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3 font-medium">
                          <span className="flex items-center gap-1 font-bold text-stone-800">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {req.phoneNumber}
                          </span>
                          <span>•</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-800">
                            TxID: <strong>{req.transactionId}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-stone-400">
                            {new Date(req.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {req.approvedAt && req.expiresAt && (
                          <div className="text-[11px] text-emerald-800 font-semibold pt-1">
                            Validity: 30 Days (Expires: {new Date(req.expiresAt).toLocaleDateString()})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {req.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(req.id, 'approved')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ፈቅድ (Approve)</span>
                          </button>
                        )}

                        {req.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(req.id, 'rejected')}
                            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>አግድ (Reject)</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
