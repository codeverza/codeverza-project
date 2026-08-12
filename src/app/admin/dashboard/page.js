'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../../lib/firebase';
import { Mail, Users, MessageSquare, LogOut, Send, RefreshCw, Clock, Phone, Briefcase, BarChart2, Inbox, Radio } from 'lucide-react';
import Swal from 'sweetalert2';

const S = {
  main:    { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: 240, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(177,76,255,0.15)', padding: '28px 0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10 },
  content: { marginLeft: 240, padding: '32px 36px', minHeight: '100vh' },
  card:    { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(177,76,255,0.15)', borderRadius: 18, padding: '24px 28px' },
  badge:   (color) => ({ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 700, color }),
};

export default function AdminDashboard() {
  const router  = useRouter();
  const [user, setUser]         = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab]           = useState('contacts');
  const [replyTo, setReplyTo]   = useState(null);
  const [replyMsg, setReplyMsg] = useState('');
  const [sending, setSending]   = useState(false);
  // broadcast state
  const [subscribers, setSubscribers] = useState([]);
  const [bSubject, setBSubject] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bMode, setBMode]       = useState('all'); // 'all' | 'single'
  const [bSingleEmail, setBSingleEmail] = useState('');
  const [bSending, setBSending] = useState(false);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace('/');
        return;
      }
      setUser(u);
      setAuthChecked(true);
      fetchContacts();
    });
    return unsub;
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(collection(db, 'contacts'));
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const sendReply = async () => {
    if (!replyMsg.trim() || !replyTo) return;
    setSending(true);

    // Loading popup
    Swal.fire({
      title: 'Sending Reply...',
      text: `Sending your reply to ${replyTo.name}`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      background: '#0d0d0d',
      color: '#fff',
    });

    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName:     replyTo.name,
          userEmail:    replyTo.email,
          userMessage:  replyTo.message,
          replyMessage: replyMsg,
        }),
      });
      if (res.ok) {
        await updateDoc(doc(db, 'contacts', replyTo.id), {
          replied: true,
          replyText: replyMsg,
          repliedAt: new Date(),
          read: true,
        });
        setContacts(prev => prev.map(c => c.id === replyTo.id
          ? { ...c, replied: true, replyText: replyMsg, read: true }
          : c
        ));
        setReplyTo(null);
        setReplyMsg('');
        Swal.fire({
          title: 'Reply Sent! ✅',
          text: `Your reply has been delivered to ${replyTo.name}.`,
          icon: 'success',
          confirmButtonText: 'Done',
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff',
          iconColor: '#28c840',
        });
      } else {
        Swal.fire({
          title: 'Failed ❌',
          text: 'Could not send reply. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff',
        });
      }
    } catch {
      Swal.fire({
        title: 'Network Error ❌',
        text: 'Something went wrong. Check your connection.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff',
      });
    }
    setSending(false);
  };

  const markAsRead = async (contact) => {
    if (contact.read) return;
    await updateDoc(doc(db, 'contacts', contact.id), { read: true });
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, read: true } : c));
  };

  const fetchSubscribers = async () => {
    const snap = await getDocs(collection(db, 'subscribers'));
    const subs = snap.docs.map(d => d.data().email).filter(Boolean);
    // also collect unique emails from contacts
    const contactEmails = contacts.map(c => c.email).filter(Boolean);
    const all = [...new Set([...subs, ...contactEmails])];
    setSubscribers(subs); // only newsletter subs for display
    return all; // merged unique for broadcast
  };

  const sendBroadcast = async () => {
    if (!bSubject.trim() || !bMessage.trim()) {
      Swal.fire({ title: 'Missing Fields', text: 'Please fill subject and message.', icon: 'warning', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
      return;
    }
    setBSending(true);
    Swal.fire({ title: 'Sending...', text: 'Broadcasting your email.', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading(), background: '#0d0d0d', color: '#fff' });

    const allEmails = await fetchSubscribers();
    const recipients = bMode === 'single'
      ? [bSingleEmail.trim()].filter(Boolean)
      : allEmails;

    if (!recipients.length) {
      Swal.fire({ title: 'No Recipients', text: 'No emails found to send to.', icon: 'error', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
      setBSending(false); return;
    }

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: bSubject, message: bMessage, recipients }),
      });
      const data = await res.json();
      Swal.fire({
        title: 'Broadcast Sent! 📢',
        html: `<p style="color:#ccc">Sent: <strong style="color:#28c840">${data.sent}</strong> &nbsp;|&nbsp; Failed: <strong style="color:#ff6b6b">${data.failed}</strong></p>`,
        icon: 'success',
        confirmButtonText: 'Done',
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff',
        iconColor: '#28c840',
      });
      setBSubject(''); setBMessage(''); setBSingleEmail('');
    } catch {
      Swal.fire({ title: 'Error', text: 'Broadcast failed.', icon: 'error', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    }
    setBSending(false);
  };

  // Analytics
  const total    = contacts.length;
  const today    = contacts.filter(c => {
    if (!c.createdAt) return false;
    const d = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return d.toDateString() === new Date().toDateString();
  }).length;
  const sources  = contacts.reduce((acc, c) => { acc[c.source || 'unknown'] = (acc[c.source || 'unknown'] || 0) + 1; return acc; }, {});
  const services = contacts.reduce((acc, c) => { if (c.service) acc[c.service] = (acc[c.service] || 0) + 1; return acc; }, {});

  const navItems = [
    { id: 'contacts',  label: 'Contacts',  icon: <Inbox size={17} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={17} /> },
    { id: 'broadcast', label: 'Broadcast', icon: <Radio size={17} /> },
  ];

  // fetch subscribers when broadcast tab opens
  useEffect(() => {
    if (tab === 'broadcast') fetchSubscribers();
  }, [tab]);

  return (
    <div style={{ display: 'flex', ...S.main }}>
      {!authChecked && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Code<span style={{ color: '#b14cff' }}>Verza</span></div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar}>
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(177,76,255,0.1)' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
            Code<span style={{ color: '#b14cff' }}>Verza</span>
          </div>
          <div style={{ fontSize: 11, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: tab === n.id ? 'rgba(177,76,255,0.15)' : 'transparent',
              color: tab === n.id ? '#e0aaff' : '#888',
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              marginBottom: 4, transition: 'all 0.2s',
            }}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 12px 24px' }}>
          {user && <div style={{ fontSize: 12, color: '#555', padding: '0 14px', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>}
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(255,50,50,0.08)', color: '#ff6b6b',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
          }}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={S.content}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
              {tab === 'contacts' ? 'Contact Submissions' : 'Analytics'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>
              {tab === 'contacts' ? `${total} total submissions` : 'Overview of your contact data'}
            </p>
          </div>
          <button onClick={fetchContacts} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(177,76,255,0.1)', border: '1px solid rgba(177,76,255,0.25)', borderRadius: 10, padding: '9px 16px', color: '#b14cff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ── CONTACTS TAB ── */}
        {tab === 'contacts' && (
          <>
            {/* stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Total Contacts', val: total,  icon: <Users size={20} />,       color: '#b14cff' },
                { label: 'Unread',         val: contacts.filter(c => !c.read).length, icon: <Mail size={20} />, color: '#ff6b6b' },
                { label: 'Replied',        val: contacts.filter(c => c.replied).length, icon: <Send size={20} />, color: '#28c840' },
              ].map((s, i) => (
                <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, background: `linear-gradient(135deg, ${s.color}, #fff)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* contacts table */}
            {loading ? (
              <div style={{ textAlign: 'center', color: '#555', padding: 60 }}>Loading...</div>
            ) : contacts.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', padding: 60 }}>No contacts yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {contacts.map((c) => (
                  <div key={c.id}
                    onClick={() => markAsRead(c)}
                    style={{
                      ...S.card,
                      borderColor: !c.read ? 'rgba(177,76,255,0.5)' : c.replied ? 'rgba(40,200,64,0.25)' : 'rgba(177,76,255,0.15)',
                      borderLeft: !c.read ? '4px solid #b14cff' : c.replied ? '4px solid #28c840' : '4px solid rgba(177,76,255,0.15)',
                      cursor: !c.read ? 'pointer' : 'default',
                      transition: 'border-color 0.2s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        {/* name + badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{c.name}</span>
                          {/* read/unread */}
                          {!c.read
                            ? <span style={{ ...S.badge('#b14cff'), display: 'flex', alignItems: 'center', gap: 4 }}>● Unread</span>
                            : !c.replied
                            ? <span style={{ ...S.badge('#888') }}>Read · No Reply</span>
                            : <span style={{ ...S.badge('#28c840'), display: 'flex', alignItems: 'center', gap: 4 }}>✓ Replied</span>
                          }
                          {c.source  && <span style={S.badge('#61dafb')}>{c.source}</span>}
                          {c.service && <span style={S.badge('#ffd43b')}>{c.service}</span>}
                        </div>

                        {/* contact info */}
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 10 }}>
                          <span style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} /> {c.email}</span>
                          {c.phone && <span style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} /> {c.phone}</span>}
                        </div>

                        {/* user message */}
                        <p style={{ margin: '0 0 10px', fontSize: 14, color: '#bbb', lineHeight: 1.7, background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 10, borderLeft: '3px solid rgba(177,76,255,0.4)' }}>
                          {c.message}
                        </p>

                        {/* reply section */}
                        {c.replied && c.replyText && (
                          <div style={{ background: 'rgba(40,200,64,0.06)', border: '1px solid rgba(40,200,64,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#28c840', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Our Reply</div>
                            <p style={{ margin: 0, fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>{c.replyText}</p>
                          </div>
                        )}

                        {c.createdAt && (
                          <div style={{ fontSize: 11, color: '#555' }}>
                            {(c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt)).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* reply button — only if not replied */}
                      {!c.replied ? (
                        <button onClick={(e) => { e.stopPropagation(); markAsRead(c); setReplyTo(c); setReplyMsg(''); }} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: 'linear-gradient(135deg, #b14cff, #6a00ff)',
                          border: 'none', borderRadius: 10, padding: '10px 18px',
                          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                        }}>
                          <Send size={13} /> Reply
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setReplyTo(c); setReplyMsg(c.replyText || ''); }} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: 'rgba(40,200,64,0.1)', border: '1px solid rgba(40,200,64,0.3)',
                          borderRadius: 10, padding: '10px 18px',
                          color: '#28c840', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                        }}>
                          <Send size={13} /> Re-reply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* source breakdown */}
            <div style={S.card}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#e0aaff' }}>Submissions by Source</h3>
              {Object.entries(sources).length === 0 ? <p style={{ color: '#555' }}>No data yet.</p> : (
                Object.entries(sources).map(([src, count]) => (
                  <div key={src} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, color: '#bbb' }}>{src}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(count / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #b14cff, #6a00ff)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#b14cff', minWidth: 20 }}>{count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* service breakdown */}
            <div style={S.card}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#e0aaff' }}>Popular Services</h3>
              {Object.entries(services).length === 0 ? <p style={{ color: '#555' }}>No data yet.</p> : (
                Object.entries(services).sort((a,b) => b[1]-a[1]).map(([svc, count]) => (
                  <div key={svc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, color: '#bbb' }}>{svc}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(count / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #61dafb, #2496ed)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#61dafb', minWidth: 20 }}>{count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* summary */}
            <div style={{ ...S.card, gridColumn: '1 / -1' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#e0aaff' }}>Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Total',      val: total,  color: '#b14cff' },
                  { label: 'Today',      val: today,  color: '#61dafb' },
                  { label: 'With Phone', val: contacts.filter(c => c.phone).length, color: '#68a063' },
                  { label: 'Services',   val: Object.keys(services).length, color: '#ffd43b' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '20px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
        {/* ── BROADCAST TAB ── */}
        {tab === 'broadcast' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ ...S.card, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#e0aaff' }}>📢 Email Broadcast</h3>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: '#666' }}>Send an email to all subscribers + contacts, or a single recipient.</p>

              {/* mode toggle */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[{ id: 'all', label: '📨 Send to All' }, { id: 'single', label: '👤 Single Recipient' }].map(m => (
                  <button key={m.id} onClick={() => setBMode(m.id)} style={{
                    padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: bMode === m.id ? 'rgba(177,76,255,0.2)' : 'rgba(255,255,255,0.05)',
                    color: bMode === m.id ? '#e0aaff' : '#888',
                    border: bMode === m.id ? '1px solid rgba(177,76,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    fontSize: 13, fontWeight: 600,
                  }}>{m.label}</button>
                ))}
              </div>

              {/* single email input */}
              {bMode === 'single' && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Recipient Email</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0 16px' }}>
                    <Mail size={15} color="rgba(177,76,255,0.7)" />
                    <input type="email" value={bSingleEmail} onChange={e => setBSingleEmail(e.target.value)} placeholder="user@email.com"
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '13px 0', fontFamily: 'inherit' }} />
                  </div>
                </div>
              )}

              {/* subject */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Subject</label>
                <input type="text" value={bSubject} onChange={e => setBSubject(e.target.value)} placeholder="Email subject..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '13px 16px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* message */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Message</label>
                <textarea value={bMessage} onChange={e => setBMessage(e.target.value)} placeholder="Write your message here..." rows={8}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '13px 16px', color: '#fff', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.75 }} />
              </div>

              <button onClick={sendBroadcast} disabled={bSending} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #b14cff, #6a00ff)',
                border: 'none', borderRadius: 12, padding: '14px 28px',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 24px rgba(177,76,255,0.4)',
              }}>
                <Radio size={16} /> {bMode === 'all' ? 'Broadcast to All' : 'Send to Recipient'}
              </button>
            </div>

            {/* subscriber count info */}
            <div style={{ ...S.card }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#e0aaff' }}>Audience</h4>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13, color: '#888' }}>📧 Contact form emails: <strong style={{ color: '#fff' }}>{[...new Set(contacts.map(c => c.email).filter(Boolean))].length}</strong></div>
                <div style={{ fontSize: 13, color: '#888' }}>📬 Newsletter subscribers: <strong style={{ color: '#fff' }}>{subscribers.length}</strong></div>
              </div>
              <button onClick={async () => { const all = await fetchSubscribers(); Swal.fire({ title: `${all.length} Recipients`, html: `<div style="text-align:left;max-height:200px;overflow-y:auto;color:#ccc;font-size:13px;">${all.map(e => `<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">${e}</div>`).join('')}</div>`, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' }); }}
                style={{ marginTop: 14, background: 'rgba(177,76,255,0.1)', border: '1px solid rgba(177,76,255,0.25)', borderRadius: 10, padding: '8px 16px', color: '#b14cff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                View All Emails
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── REPLY MODAL ── */}
      {replyTo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid rgba(177,76,255,0.3)', borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 520 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>Reply to {replyTo.name}</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#666' }}>{replyTo.email}</p>
            <textarea
              value={replyMsg} onChange={e => setReplyMsg(e.target.value)}
              placeholder="Type your reply..."
              rows={6}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(177,76,255,0.25)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={sendReply} disabled={sending} style={{ flex: 1, padding: 14, background: 'linear-gradient(135deg, #b14cff, #6a00ff)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
              <button onClick={() => setReplyTo(null)} style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#888', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
