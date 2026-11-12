import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  RefreshCw,
  Search,
  Download,
  Upload,
  UserPlus,
  Trash2,
  Menu,
  X,
  Users,
  Database,
  Mail,
} from 'lucide-react';
import SeoHead from '../components/SeoHead';
import BrandLogo from '../components/BrandLogo';
import { API_BASE_URL } from '../config';

function parseCsvRows(text) {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const splitCsvLine = (line) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const rawHeaders = splitCsvLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const mapHeader = (key) => {
    if (key.includes('membership') || key === 'id' || key === 'memberno') return 'membershipNo';
    if (key === 'name' || key.includes('fullname')) return 'name';
    if (key.includes('email')) return 'email';
    if (key.includes('phone') || key.includes('mobile') || key.includes('contact')) return 'phone';
    if (key.includes('category')) return 'category';
    if (key.includes('specialty') || key.includes('speciality')) return 'specialty';
    if (key.includes('city') || key.includes('place')) return 'city';
    return key;
  };

  const fields = rawHeaders.map(mapHeader);
  return lines
    .slice(1)
    .map((line) => {
      const cols = splitCsvLine(line);
      const obj = {};
      fields.forEach((f, idx) => {
        if (cols[idx] !== undefined && cols[idx] !== '') obj[f] = cols[idx];
      });
      return obj;
    })
    .filter((r) => r.membershipNo && r.name);
}

export default function AdminDashboard({ onShowToast }) {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [directoryMembers, setDirectoryMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('memberships');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [newMember, setNewMember] = useState({
    membershipNo: '',
    name: '',
    email: '',
    phone: '',
    category: 'Life Member',
    specialty: '',
    city: '',
  });

  const token = localStorage.getItem('tns_admin_token');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('tns_admin_token');
    localStorage.removeItem('tns_admin_user');
    navigate('/admin');
  }, [navigate]);

  const loadData = useCallback(async () => {
    if (!token) {
      navigate('/admin');
      return;
    }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const q = encodeURIComponent(search);
      const [memRes, enqRes, dirRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/memberships?search=${q}`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/enquiries?search=${q}`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/members-directory?search=${q}`, { headers }),
      ]);

      if (
        memRes.status === 401 ||
        memRes.status === 403 ||
        enqRes.status === 401 ||
        enqRes.status === 403 ||
        dirRes.status === 401 ||
        dirRes.status === 403
      ) {
        handleLogout();
        return;
      }

      if (memRes.ok) setMemberships(await memRes.json());
      if (enqRes.ok) setEnquiries(await enqRes.json());
      if (dirRes.ok) setDirectoryMembers(await dirRes.json());
    } catch {
      if (onShowToast) onShowToast('Unable to fetch Secretariat records from backend.');
    } finally {
      setLoading(false);
    }
  }, [token, search, navigate, handleLogout, onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateMembershipStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/memberships/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        if (onShowToast) onShowToast(`Membership marked as ${status}.`);
        loadData();
      }
    } catch {
      if (onShowToast) onShowToast('Failed to update status.');
    }
  };

  const handleAddDirectoryMember = async (e) => {
    e.preventDefault();
    if (!newMember.membershipNo.trim() || !newMember.name.trim()) return;
    setImporting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/members-directory/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ members: [newMember] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save member record.');
      if (onShowToast) onShowToast('Member saved to Know Your Membership directory.');
      setNewMember({
        membershipNo: '',
        name: '',
        email: '',
        phone: '',
        category: 'Life Member',
        specialty: '',
        city: '',
      });
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      let records = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text);
        records = Array.isArray(parsed) ? parsed : parsed.members || [];
      } else {
        records = parseCsvRows(text);
      }

      if (!records.length) {
        throw new Error(
          'No valid records found. Ensure columns/fields include membershipNo and name.'
        );
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/members-directory/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ members: records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk import failed.');
      if (onShowToast) {
        onShowToast(`Imported/updated ${data.imported} member records into directory.`);
      }
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message);
    } finally {
      e.target.value = '';
      setImporting(false);
    }
  };

  const handleDeleteDirectoryMember = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/members-directory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (onShowToast) onShowToast('Member record removed from directory.');
        loadData();
      }
    } catch {
      if (onShowToast) onShowToast('Failed to delete member record.');
    }
  };

  const handleExportCSV = () => {
    const rows =
      activeTab === 'memberships'
        ? memberships
        : activeTab === 'enquiries'
        ? enquiries
        : directoryMembers;
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tns-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sidebarSections = [
    {
      id: 'memberships',
      label: 'Membership Requests',
      count: memberships.length,
      icon: Users,
    },
    {
      id: 'directory',
      label: 'Member Directory',
      count: directoryMembers.length,
      icon: Database,
    },
    {
      id: 'enquiries',
      label: 'Contact Enquiries',
      count: enquiries.length,
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-10 lg:py-12 px-4 sm:px-6 text-[#292638]">
      <SeoHead title="Secretariat Dashboard" path="/admin/dashboard" />

      <div className="max-w-7xl mx-auto text-left">
        {/* Top Header Bar */}
        <div className="tns-surface p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden min-h-[42px] min-w-[42px] rounded-lg border border-[#E3DCCF] bg-[#FAF6ED] text-[#393185] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label={sidebarOpen ? 'Close admin sidebar' : 'Open admin sidebar'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="shrink-0">
              <BrandLogo variant="header" showWordmark={false} to="/admin/dashboard" />
            </div>
            <div className="min-w-0">
              <h1 className="font-editorial text-xl sm:text-2xl font-bold text-[#393185] truncate">
                TNS Secretariat Admin
              </h1>
              <p className="text-xs text-[#666477] leading-snug">
                Manage membership requests, Know Your Membership directory, and contact enquiries
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={loadData}
              className="tns-btn-secondary text-xs py-2 px-3 min-h-[40px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="tns-btn-secondary text-xs py-2 px-3 min-h-[40px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="tns-btn-primary text-xs py-2 px-3 min-h-[40px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {sidebarSections.map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveTab(sec.id);
                  setSidebarOpen(false);
                }}
                className={`tns-surface p-4 flex items-center justify-between text-left transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-[#393185] bg-[#FAF6ED]' : 'hover:border-[#C18C26]'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26] block">
                    {sec.label}
                  </span>
                  <span className="font-editorial text-2xl font-bold text-[#393185] mt-1 block">
                    {sec.count}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#E9E6F5] text-[#393185] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Responsive Two-Column Layout: Collapsible Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation (Collapsible Drawer on Mobile, Persistent Column on Desktop) */}
          <aside
            className={`lg:col-span-3 tns-surface p-4 space-y-2 ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}
            aria-label="Admin section navigation"
          >
            <div className="px-2 pb-2 border-b border-[#E3DCCF] flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#393185]">
                Sections
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-xs font-semibold text-[#666477] hover:text-[#393185] cursor-pointer"
              >
                Hide
              </button>
            </div>
            {sidebarSections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(sec.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#393185] text-[#FBF8F1]'
                      : 'text-[#292638] hover:bg-[#FAF6ED]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#B0CB1F]' : 'text-[#393185]'}`} />
                    <span className="truncate">{sec.label}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isSelected ? 'bg-white/15 text-white' : 'bg-[#F1EADB] text-[#393185]'
                    }`}
                  >
                    {sec.count}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Main Admin Workspace */}
          <div className="lg:col-span-9 min-w-0 space-y-5">
            {/* Quick Filter Search */}
            <div className="tns-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm font-bold text-[#393185]">
                {sidebarSections.find((s) => s.id === activeTab)?.label}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#666477] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, number..."
                  className="tns-input pl-9 py-2 text-xs"
                />
              </div>
            </div>

        {/* Member Directory Upload / Quick-Add Controls */}
        {activeTab === 'directory' && (
          <div className="tns-surface p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3DCCF] pb-3.5">
              <div>
                <h2 className="font-editorial text-lg font-bold text-[#393185]">
                  Know Your Membership Directory
                </h2>
                <p className="text-xs text-[#666477]">
                  Add individual members or upload a CSV / JSON file (columns:{' '}
                  <code>Membership No, Name, Email, Phone</code>) for public lookup on{' '}
                  <code>/know-your-details</code>.
                </p>
              </div>
              <label className="tns-btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-2 cursor-pointer shrink-0 w-fit">
                <Upload className="w-3.5 h-3.5 text-[#C18C26]" />
                <span>{importing ? 'Uploading...' : 'Upload CSV / JSON'}</span>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>

            <form
              onSubmit={handleAddDirectoryMember}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
            >
              <div>
                <label className="block text-[11px] font-semibold text-[#393185] mb-1">
                  Membership No *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.membershipNo}
                  onChange={(e) =>
                    setNewMember((p) => ({ ...p, membershipNo: e.target.value }))
                  }
                  placeholder="TNS-001"
                  className="tns-input py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#393185] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Dr. Full Name"
                  className="tns-input py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#393185] mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))}
                  placeholder="doctor@example.com"
                  className="tns-input py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#393185] mb-1">
                  Mobile No.
                </label>
                <input
                  type="text"
                  value={newMember.phone}
                  onChange={(e) => setNewMember((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="9849012345"
                  className="tns-input py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#393185] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newMember.category}
                  onChange={(e) => setNewMember((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Life Member"
                  className="tns-input py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={importing}
                className="tns-btn-primary py-2 px-4 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#B0CB1F]" />
                <span>Add Member</span>
              </button>
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="tns-surface overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-[#666477]">Loading records...</div>
          ) : activeTab === 'memberships' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1EADB] text-[#393185] uppercase tracking-wider border-b border-[#E3DCCF]">
                  <th className="py-3.5 px-4 font-bold">Applicant</th>
                  <th className="py-3.5 px-4 font-bold">Specialty / Category</th>
                  <th className="py-3.5 px-4 font-bold">Institution</th>
                  <th className="py-3.5 px-4 font-bold">Contact</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCF]">
                {memberships.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#666477]">
                      No membership requests found.
                    </td>
                  </tr>
                ) : (
                  memberships.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3.5 px-4 font-semibold text-[#292638]">{m.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="block font-medium text-[#393185]">{m.specialty}</span>
                        <span className="text-[#666477]">{m.category || 'Member'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#666477]">{m.hospital}</td>
                      <td className="py-3.5 px-4 text-[#666477]">
                        <div>{m.email}</div>
                        <div>{m.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EDF3CE] text-[#292638] font-semibold">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateMembershipStatus(m.id, 'Approved')}
                          className="px-2.5 py-1 rounded bg-[#393185] text-[#FBF8F1] font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMembershipStatus(m.id, 'Rejected')}
                          className="px-2.5 py-1 rounded border border-[#E3DCCF] text-[#666477] cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : activeTab === 'directory' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1EADB] text-[#393185] uppercase tracking-wider border-b border-[#E3DCCF]">
                  <th className="py-3.5 px-4 font-bold">Membership No</th>
                  <th className="py-3.5 px-4 font-bold">Full Name</th>
                  <th className="py-3.5 px-4 font-bold">Email ID</th>
                  <th className="py-3.5 px-4 font-bold">Mobile No.</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCF]">
                {directoryMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#666477]">
                      No directory members uploaded yet. Use the Add Member form or Upload CSV / JSON button above.
                    </td>
                  </tr>
                ) : (
                  directoryMembers.map((dm) => (
                    <tr key={dm.id}>
                      <td className="py-3.5 px-4 font-bold text-[#393185]">{dm.membershipNo}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#292638]">{dm.name}</td>
                      <td className="py-3.5 px-4 text-[#666477]">{dm.email || '—'}</td>
                      <td className="py-3.5 px-4 text-[#666477]">{dm.phone || '—'}</td>
                      <td className="py-3.5 px-4 text-[#666477]">{dm.category || '—'}</td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteDirectoryMember(dm.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#E3DCCF] text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1EADB] text-[#393185] uppercase tracking-wider border-b border-[#E3DCCF]">
                  <th className="py-3.5 px-4 font-bold">Sender</th>
                  <th className="py-3.5 px-4 font-bold">Contact</th>
                  <th className="py-3.5 px-4 font-bold">Subject</th>
                  <th className="py-3.5 px-4 font-bold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCF]">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#666477]">
                      No contact enquiries found.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((q) => (
                    <tr key={q.id}>
                      <td className="py-3.5 px-4 font-semibold text-[#292638]">{q.name}</td>
                      <td className="py-3.5 px-4 text-[#666477]">
                        <div>{q.email}</div>
                        <div>{q.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#393185]">{q.subject}</td>
                      <td className="py-3.5 px-4 text-[#666477] max-w-md">{q.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
