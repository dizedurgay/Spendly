import { useEffect, useMemo, useState } from 'react';
import React from "react";

const STORAGE_KEY = 'Spendly-expenses-v1';
const THEME_KEY = 'Spendly-theme-v1';
const CATEGORIES = [
  { id: 'yeme', label: 'Yeme & İçme', emoji: '🍕', color: '#ff9275', soft: '#fff0e9' },
  { id: 'market', label: 'Market', emoji: '🛒', color: '#8a78ef', soft: '#f0ecff' },
  { id: 'ulasim', label: 'Ulaşım', emoji: '🚕', color: '#f4b94c', soft: '#fff5dc' },
  { id: 'eglence', label: 'Eğlence', emoji: '🎬', color: '#e782b5', soft: '#ffedf6' },
  { id: 'alisveris', label: 'Alışveriş', emoji: '🛍️', color: '#63b4ea', soft: '#eaf7ff' },
  { id: 'fatura', label: 'Faturalar', emoji: '💡', color: '#66c9b3', soft: '#e6faf4' },
  { id: 'diger', label: 'Diğer', emoji: '✨', color: '#9e9eae', soft: '#f2f1f6' },
];
const EMPTY_FORM = { title: '', amount: '', category: 'yeme', date: todayLocal(), note: '' };
const money = (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(value);
function todayLocal() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function safeLoad() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string' && Number.isFinite(Number(item.amount))) : [];
  } catch { return []; }
}
function Icon({ name, size = 20 }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <path d="M20.99 13A9 9 0 0 1 11 3.01 9 9 0 1 0 20.99 13Z"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    pen: <><path d="M12 20h9"/><path d="M16 4a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"/></>,
    close: <path d="M18 6 6 18M6 6l12 12"/>,
    wallet: <><rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18M6 6V4a1 1 0 0 1 1-1h11"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
    arrow: <><path d="m7 17 10-10M8 7h9v9"/></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function ExpenseModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ? { ...initial, amount: String(initial.amount) } : { ...EMPTY_FORM, date: todayLocal() });
  const [error, setError] = useState('');
  function submit(e) {
    e.preventDefault();
    const amount = Number(String(form.amount).replace(',', '.'));
    if (!form.title.trim()) return setError('Harcama adını gir.');
    if (!Number.isFinite(amount) || amount <= 0) return setError('Sıfırdan büyük geçerli bir tutar gir.');
    if (!Number.isSafeInteger(Math.round(amount * 100)) || amount > 1_000_000_000) return setError('Tutar çok büyük.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || Number.isNaN(new Date(`${form.date}T12:00:00`).getTime())) return setError('Geçerli bir tarih seç.');
    if (!CATEGORIES.some((category) => category.id === form.category)) return setError('Geçerli bir kategori seç.');
    onSave({ ...form, title: form.title.trim(), note: form.note.trim(), amount: Math.round(amount * 100) / 100 });
  }
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head"><div><div className="eyebrow">HARCAMA DETAYLARI</div><h2 id="modal-title">{initial ? 'Harcamayı düzenle' : 'Yeni harcama ekle'} <span>✦</span></h2></div><button className="icon-button" onClick={onClose} aria-label="Kapat"><Icon name="close"/></button></div>
      <form onSubmit={submit}>
        <label>Harcama adı<input maxLength={70} autoFocus value={form.title} placeholder="Örn. Arkadaşlarla kahve" onChange={(e) => setForm({ ...form, title: e.target.value })}/></label>
        <div className="form-grid"><label>Tutar (₺)<input type="number" min="0.01" max="1000000000" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}/></label><label>Tarih<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}/></label></div>
        <label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.emoji} {item.label}</option>)}</select></label>
        <label>Not <span className="optional">(isteğe bağlı)</span><textarea maxLength={240} placeholder="Küçük bir not ekleyebilirsin..." rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}/></label>
        {error && <div className="error" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" className="button button-light" onClick={onClose}>Vazgeç</button><button className="button button-primary" type="submit"><Icon name="check" size={17}/>{initial ? 'Değişiklikleri kaydet' : 'Harcamayı kaydet'}</button></div>
      </form>
    </div>
  </div>;
}
export default function App() {
  const [expenses, setExpenses] = useState(safeLoad);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem(THEME_KEY, theme); }, [theme]);
  useEffect(() => {
    if (!modal && !deleting) return;
    function onKey(e) { if (e.key === 'Escape') { setModal(null); setDeleting(null); } }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, deleting]);
  const months = useMemo(() => [...new Set(expenses.map((e) => String(e.date).slice(0, 7)))].filter((m) => /^\d{4}-\d{2}$/.test(m)).sort().reverse(), [expenses]);
  const filtered = useMemo(() => expenses.filter((e) => {
    const q = search.toLocaleLowerCase('tr-TR').trim();
    const category = CATEGORIES.find((c) => c.id === e.category);
    return (!q || `${e.title} ${e.note || ''} ${category?.label || ''}`.toLocaleLowerCase('tr-TR').includes(q)) && (categoryFilter === 'all' || e.category === categoryFilter) && (monthFilter === 'all' || e.date?.startsWith(monthFilter));
  }).sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id))), [expenses, search, categoryFilter, monthFilter]);
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const currentMonth = todayLocal().slice(0, 7);
  const monthTotal = expenses.filter((e) => e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + Number(e.amount), 0);
  const avg = expenses.length ? total / expenses.length : 0;
  const featuredCategories = useMemo(() => CATEGORIES.map((c) => ({ ...c, total: expenses.filter((e) => e.category === c.id).reduce((sum, e) => sum + Number(e.amount), 0) })).filter((c) => c.total > 0).sort((a,b) => b.total-a.total).slice(0,4), [expenses]);
  const editExpense = (value) => { setExpenses((prev) => value.id ? prev.map((e) => e.id === value.id ? value : e) : [{ ...value, id: crypto.randomUUID() }, ...prev]); setModal(null); };
  const removeExpense = () => { if (deleting) setExpenses((prev) => prev.filter((e) => e.id !== deleting.id)); setDeleting(null); };
  const resetFilters = () => { setSearch(''); setCategoryFilter('all'); setMonthFilter('all'); };
  return <div className="app-shell">
    <header className="header"><div className="header-inner"><a className="brand" href="#anasayfa" aria-label="Spendly ana sayfa"><span className="brand-icon">✿</span><span>Spendly</span></a><div className="header-right"><div className="header-note">Paran, senin kontrolünde <span>✦</span></div><button className="theme-button" onClick={() => setTheme((v) => v === 'dark' ? 'light' : 'dark')} title="Temayı değiştir" aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19}/><span>{theme === 'dark' ? 'Açık tema' : 'Koyu tema'}</span></button></div></div></header>
    <main id="anasayfa" className="main">
      <section className="hero"><div className="hero-copy"><div className="pill"><span className="pill-star">✦</span> KİŞİSEL FİNANS ALANIN</div><h1>Harcamalarını takip et,<br/><em>hayatına renk kat!</em><span className="heading-star"> ✳</span></h1><p>Her kuruşun nereye gittiğini bilmek artık çok kolay. Harcamalarını ekle, düzenle ve tüm kontrolü eline al.</p><button className="button button-primary hero-button" onClick={() => setModal({ mode: 'add' })}><Icon name="plus" size={19}/> Yeni harcama ekle <span className="button-arrow">↗</span></button></div><div className="hero-art" aria-hidden="true"><div className="art-big-circle"></div><div className="art-card art-card-one"><span>☕</span><div>Kahve molası<small>− ₺145,00</small></div></div><div className="art-card art-card-two"><span>🎟️</span><div>Güzel anlar<small>Her an değerli!</small></div></div><div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div><div className="art-coins">₺</div></div></section>
      <section className="summary-grid" aria-label="Harcama özeti"><div className="summary-card purple"><div className="summary-top"><span>Toplam harcama</span><div className="summary-icon"><Icon name="wallet"/></div></div><div className="summary-value">{money(total)}</div><div className="summary-bottom">Tüm kayıtların toplamı <span>✳</span></div></div><div className="summary-card peach"><div className="summary-top"><span>Bu ay harcadığın</span><div className="summary-icon"><Icon name="calendar"/></div></div><div className="summary-value">{money(monthTotal)}</div><div className="summary-bottom">{new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} <span>✴</span></div></div><div className="summary-card mint"><div className="summary-top"><span>Ortalama harcama</span><div className="summary-icon"><Icon name="arrow"/></div></div><div className="summary-value">{money(avg)}</div><div className="summary-bottom">{expenses.length} kayıt üzerinden <span>✦</span></div></div></section>
      <section className="content-grid"><div className="expenses-panel"><div className="section-heading"><div><div className="eyebrow">TÜM HARCAMALARIN</div><h2>Harcama listem <span className="heading-flower">✿</span></h2><p>Eklediğin harcamaları buradan yönetebilirsin.</p></div><button className="button button-primary add-small" onClick={() => setModal({ mode: 'add' })}><Icon name="plus" size={17}/> Yeni ekle</button></div><div className="filters"><div className="search-box"><Icon name="search" size={19}/><input aria-label="Harcamalarda ara" placeholder="Harcama ara..." value={search} onChange={(e) => setSearch(e.target.value)}/></div><div className="filter-select"><Icon name="filter" size={17}/><select aria-label="Kategoriye göre filtrele" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">Tüm kategoriler</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div><div className="filter-select month-select"><select aria-label="Aya göre filtrele" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}><option value="all">Tüm zamanlar</option>{months.map((m) => <option key={m} value={m}>{new Date(`${m}-01T12:00:00`).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</option>)}</select></div></div>
        <div className="list-labels"><span>HARCAMA</span><span>TUTAR / İŞLEM</span></div>
        {filtered.length ? <div className="expense-list">{filtered.map((item) => { const category = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES.at(-1); return <div className="expense-item" key={item.id}><div className="expense-info"><div className="category-icon" style={{ backgroundColor: category.soft }}>{category.emoji}</div><div className="expense-copy"><strong>{item.title}</strong><div className="expense-meta"><span>{category.label}</span><i>•</i><span>{new Date(`${item.date}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>{item.note && <div className="expense-note">{item.note}</div>}</div></div><div className="expense-actions"><strong>{money(Number(item.amount))}</strong><div className="action-buttons"><button title="Düzenle" aria-label={`${item.title} harcamasını düzenle`} onClick={() => setModal({ mode: 'edit', item })}><Icon name="pen" size={16}/></button><button className="danger" title="Sil" aria-label={`${item.title} harcamasını sil`} onClick={() => setDeleting(item)}><Icon name="trash" size={16}/></button></div></div></div>; })}</div> : <div className="empty-state"><div className="empty-art">🧾</div><h3>{expenses.length ? 'Eşleşen harcama bulunamadı' : 'Henüz harcama eklemedin'}</h3><p>{expenses.length ? 'Arama veya filtrelerini değiştirerek tekrar dene.' : 'İlk harcamanı ekle, rengârenk bir başlangıç yap!'}</p><button className="button button-light" onClick={expenses.length ? resetFilters : () => setModal({ mode: 'add' })}>{expenses.length ? 'Filtreleri temizle' : '+ İlk harcamayı ekle'}</button></div>}
        <div className="list-footer">{filtered.length} harcama gösteriliyor <span>✦</span></div>
      </div><aside className="sidebar"><div className="category-panel"><div className="eyebrow">BİR BAKIŞTA</div><h3>Kategoriler <span>✳</span></h3><p>Harcamaların nereye gidiyor?</p>{featuredCategories.length ? <div className="category-list">{featuredCategories.map((item) => <div className="category-line" key={item.id}><div className="cat-label"><span>{item.emoji} {item.label}</span><strong>{money(item.total)}</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${(item.total / total) * 100}%`, backgroundColor: item.color }} /></div></div>)}</div> : <div className="category-empty">Kategorilerini görmek için harcama ekle 🌷</div>}</div><div className="tip-card"><div className="tip-icon">💡</div><h3>Küçük bir ipucu!</h3><p>Her harcamayı kaydetmek, bütçeni daha iyi tanımanın ilk adımıdır.</p><div className="tip-decoration">✿</div></div><div className="privacy-note">🔒 Verilerin sadece bu tarayıcıda saklanır. Hesap veya sunucu gerekmez.</div></aside></section>
    </main><footer>Spendly <span>✿</span> Sevgiyle tasarlandı • 2026</footer>
    {modal && <ExpenseModal initial={modal.mode === 'edit' ? modal.item : null} onClose={() => setModal(null)} onSave={editExpense} />}
    {deleting && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleting(null); }}><div className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div className="delete-emoji">🗑️</div><h2 id="delete-title">Harcamayı silelim mi?</h2><p><strong>{deleting.title}</strong> kaydı kalıcı olarak silinecek.</p><div className="modal-actions"><button className="button button-light" onClick={() => setDeleting(null)}>Vazgeç</button><button className="button button-danger" onClick={removeExpense}>Evet, sil</button></div></div></div>}
  </div>;
}
