'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import './servicework.css';

type Tab = 'services' | 'providers';
type ModalKind = 'category' | 'provider' | null;

interface Category {
  id: string;
  name: string;
  providers: number;
}

interface Provider {
  id: string;
  name: string;
  phone: string;
  categoryId: string;
}

function asList(data: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
  }
  return [];
}

function mapProviders(rows: Record<string, unknown>[]): Provider[] {
  return rows.map((item) => ({
    id: String(item.id ?? ''),
    name: String(item.name || item.full_name || item.member_name || 'Provider'),
    phone: String(item.phone || item.mobile || item.mobile_number || ''),
    categoryId: String(item.categoryId || item.category_id || item.category || ''),
  }));
}

function mapCategories(
  rows: Record<string, unknown>[],
  providers: Provider[],
): Category[] {
  return rows.map((item) => {
    const id = String(item.id ?? '');
    const apiCount = Number(item.count ?? item.providers_count ?? 0);
    const computed = providers.filter((p) => p.categoryId === id).length;
    return {
      id,
      name: String(item.name || item.category || 'Service'),
      providers: apiCount > 0 ? apiCount : computed,
    };
  });
}

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modal, setModal] = useState<ModalKind>(null);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [providerCategory, setProviderCategory] = useState('');
  const [toast, setToast] = useState('');
  const [toastTone, setToastTone] = useState<'ok' | 'err'>('ok');

  const showToast = useCallback((message: string, tone: 'ok' | 'err' = 'ok') => {
    setToastTone(tone);
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }, []);

  const resetModal = () => {
    setModal(null);
    setCategoryName('');
    setProviderName('');
    setProviderPhone('');
    setProviderCategory('');
    setSaving(false);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, memRes] = await Promise.all([
        apiFetch('/api/categories'),
        apiFetch('/api/members'),
      ]);
      if (!catRes.ok || !memRes.ok) throw new Error('load failed');

      const mappedProviders = mapProviders(
        asList(await memRes.json(), ['members', 'providers', 'data']),
      );
      const mappedCategories = mapCategories(
        asList(await catRes.json(), ['categories', 'data']),
        mappedProviders,
      );
      setProviders(mappedProviders);
      setCategories(mappedCategories);
    } catch {
      setCategories([]);
      setProviders([]);
      showToast('Could not load service data. Showing empty workspace.', 'err');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    requireAuth();
    void loadData();
  }, [loadData]);

  const openCategoryModal = () => setModal('category');

  const openProviderModal = (categoryId?: string) => {
    if (categories.length === 0) {
      showToast('Please create a service category first.', 'err');
      return;
    }
    setProviderCategory(categoryId || categories[0].id);
    setModal('provider');
  };

  const handleCreateCategory = async () => {
    const name = categoryName.trim();
    if (!name) return showToast('Category name is required.', 'err');
    setSaving(true);
    try {
      const res = await apiFetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        showToast(String(data?.error || 'Failed to create category.'), 'err');
        return;
      }
      resetModal();
      showToast(`${name} category created successfully.`);
      await loadData();
    } catch {
      showToast('Failed to create category.', 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProvider = async () => {
    const name = providerName.trim();
    const phone = providerPhone.trim();
    if (!name) return showToast('Provider name is required.', 'err');
    if (!phone) return showToast('Phone number is required.', 'err');
    if (!providerCategory) return showToast('Please select a category.', 'err');

    setSaving(true);
    try {
      const res = await apiFetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, category: providerCategory }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        showToast(String(data?.error || 'Failed to add provider.'), 'err');
        return;
      }
      resetModal();
      showToast(`${name} added successfully.`);
      await loadData();
    } catch {
      showToast('Failed to add provider.', 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    if (
      category.providers > 0 ||
      providers.some((p) => p.categoryId === categoryId)
    ) {
      showToast('Remove providers from this category first.', 'err');
      return;
    }
    try {
      const res = await apiFetch(
        `/api/categories/${encodeURIComponent(categoryId)}`,
        { method: 'DELETE' },
      );
      const data = res.status === 204 ? null : await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        showToast(String(data?.error || 'Failed to delete category.'), 'err');
        return;
      }
      showToast(`${category.name} deleted successfully.`);
      await loadData();
    } catch {
      showToast('Failed to delete category.', 'err');
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;
    try {
      const res = await apiFetch(
        `/api/members/${encodeURIComponent(providerId)}`,
        { method: 'DELETE' },
      );
      const data = res.status === 204 ? null : await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        showToast(String(data?.error || 'Failed to delete provider.'), 'err');
        return;
      }
      showToast(`${provider.name} deleted successfully.`);
      await loadData();
    } catch {
      showToast('Failed to delete provider.', 'err');
    }
  };

  const totalProviders = providers.length;
  const unassigned = categories.filter((c) => c.providers === 0).length;
  const topCategory =
    categories.length > 0
      ? [...categories].sort((a, b) => b.providers - a.providers)[0]
      : null;

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );
  }, [categories, search]);

  const filteredProviders = useMemo(() => {
    const q = search.toLowerCase();
    return providers.filter((p) => {
      const hit =
        p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q);
      const catOk = categoryFilter === 'all' || p.categoryId === categoryFilter;
      return hit && catOk;
    });
  }, [providers, search, categoryFilter]);

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name || 'Unassigned';

  const healthWidth = categories.length
    ? Math.max(25, 100 - (unassigned / categories.length) * 100)
    : 0;

  return (
    <div className="service-shell">
      <div className="service-background">
        <div className="grid-overlay" />
        <div className="glow glow-purple" />
        <div className="glow glow-blue" />
      </div>

      {toast && (
        <div className="service-toast">
          <div className="toast-icon">{toastTone === 'ok' ? '✓' : '!'}</div>
          <div>
            <strong>{toastTone === 'ok' ? 'Success' : 'Notice'}</strong>
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast('')}>
            ×
          </button>
        </div>
      )}

      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) resetModal();
          }}
        >
          <div className="service-modal">
            <div className="modal-top-line" />
            <div className="modal-header">
              <div className="modal-title-area">
                <div
                  className={
                    modal === 'category' ? 'modal-icon purple' : 'modal-icon blue'
                  }
                >
                  {modal === 'category' ? '◆' : '♟'}
                </div>
                <div>
                  <span>
                    {modal === 'category'
                      ? 'SERVICE MANAGEMENT'
                      : 'PROVIDER MANAGEMENT'}
                  </span>
                  <h2>
                    {modal === 'category'
                      ? 'Create Service Category'
                      : 'Add Service Provider'}
                  </h2>
                  <p>
                    {modal === 'category'
                      ? 'Create a new service category for your network.'
                      : 'Register a provider and assign a service category.'}
                  </p>
                </div>
              </div>
              <button type="button" className="modal-close" onClick={resetModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {modal === 'category' ? (
                <>
                  <div className="form-group">
                    <label>
                      Category Name<span>*</span>
                    </label>
                    <input
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g. Emergency Services"
                      autoFocus
                    />
                  </div>
                  <div className="form-info">
                    <span>◆</span>
                    <div>
                      <strong>New category</strong>
                      <small>
                        Providers can be assigned after the category is created.
                      </small>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>
                      Provider Name<span>*</span>
                    </label>
                    <input
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      placeholder="e.g. City Police Department"
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Phone Number<span>*</span>
                    </label>
                    <input
                      value={providerPhone}
                      onChange={(e) => setProviderPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Service Category<span>*</span>
                    </label>
                    <select
                      value={providerCategory}
                      onChange={(e) => setProviderCategory(e.target.value)}
                    >
                      <option value="">Select service category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="provider-preview">
                    <div className="preview-avatar">
                      {providerName ? providerName.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <span>PROVIDER PREVIEW</span>
                      <strong>{providerName || 'Provider name'}</strong>
                      <small>
                        {providerCategory
                          ? catName(providerCategory)
                          : 'No category selected'}
                      </small>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-cancel"
                onClick={resetModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  modal === 'category'
                    ? 'modal-primary purple'
                    : 'modal-primary blue'
                }
                onClick={
                  modal === 'category'
                    ? handleCreateCategory
                    : handleCreateProvider
                }
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-loader" />
                    Saving...
                  </>
                ) : modal === 'category' ? (
                  '◆ Create Category'
                ) : (
                  '♟ Add Provider'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="service-layout">
        <header className="service-header">
          <div className="service-brand">
            <div className="service-logo">⚡</div>
            <div>
              <h1>Service Operations</h1>
              <p>Service category & provider management</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="system-status">
              <span className="pulse-dot" />
              {loading ? 'Loading workspace…' : 'All systems operational'}
            </div>
            <button
              type="button"
              className="header-icon-button"
              onClick={() => {
                void loadData();
                showToast('Workspace refreshed.');
              }}
            >
              ↻
            </button>
            <Link href="/dashboard" className="dashboard-button">
              ↗ Dashboard
            </Link>
          </div>
        </header>

        <section className="service-hero">
          <div className="hero-left">
            <div className="hero-label">
              <span />
              SERVICE MANAGEMENT PLATFORM
            </div>
            <h2>
              One workspace.
              <br />
              <strong>Every service connected.</strong>
            </h2>
            <p>
              Create service categories, register providers and manage your
              entire service network from one professional workspace.
            </p>
            <div className="hero-buttons">
              <button
                type="button"
                className="button-primary"
                onClick={() => openProviderModal()}
              >
                ♟ Add Provider
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={openCategoryModal}
              >
                ＋ Create Category
              </button>
            </div>
          </div>
          <div className="hero-right">
            <div className="network-card">
              <div className="network-card-header">
                <div>
                  <span>NETWORK HEALTH</span>
                  <strong>{unassigned === 0 ? 'Excellent' : 'Good'}</strong>
                </div>
                <div className="health-icon">✦</div>
              </div>
              <div className="health-meter">
                <span style={{ width: `${healthWidth}%` }} />
              </div>
              <div className="network-metrics">
                <div>
                  <small>Categories</small>
                  <strong>{categories.length}</strong>
                </div>
                <div>
                  <small>Providers</small>
                  <strong>{totalProviders}</strong>
                </div>
                <div>
                  <small>Unassigned</small>
                  <strong>{unassigned}</strong>
                </div>
              </div>
              <div className="network-footer">
                <i>●</i>
                {loading ? 'Syncing workspace…' : 'Live workspace synchronized'}
              </div>
            </div>
          </div>
        </section>

        <section className="kpi-grid">
          {[
            {
              cls: 'purple',
              icon: '◆',
              label: 'Total Categories',
              value: categories.length,
              note: 'Active service categories',
            },
            {
              cls: 'blue',
              icon: '♟',
              label: 'Total Providers',
              value: totalProviders,
              note: 'Registered professionals',
            },
            {
              cls: 'green',
              icon: '↗',
              label: 'Top Category',
              value: topCategory?.name || '—',
              note: topCategory
                ? `${topCategory.providers} providers`
                : 'No providers',
            },
            {
              cls: 'orange',
              icon: '!',
              label: 'Needs Attention',
              value: unassigned,
              note: 'Categories without providers',
            },
          ].map((kpi) => (
            <div key={kpi.label} className={`kpi-card ${kpi.cls}`}>
              <div className="kpi-icon">{kpi.icon}</div>
              <div className="kpi-content">
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>{kpi.note}</small>
              </div>
              <div className="kpi-decoration">{kpi.icon}</div>
            </div>
          ))}
        </section>

        <section className="workspace">
          <div className="workspace-top">
            <div>
              <span className="workspace-label">MANAGEMENT CONSOLE</span>
              <h2>Service Workspace</h2>
              <p>Create, organize and manage services and providers.</p>
            </div>
            <div className="workspace-actions">
              <button
                type="button"
                className="small-action"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  showToast('Filters cleared.');
                }}
              >
                ⟳ Reset
              </button>
              <button
                type="button"
                className="small-action primary"
                onClick={openCategoryModal}
              >
                ＋ Add Service
              </button>
            </div>
          </div>

          <div className="workspace-tabs">
            <button
              type="button"
              className={activeTab === 'services' ? 'active' : ''}
              onClick={() => setActiveTab('services')}
            >
              ◆ Services<span>{categories.length}</span>
            </button>
            <button
              type="button"
              className={activeTab === 'providers' ? 'active' : ''}
              onClick={() => setActiveTab('providers')}
            >
              ♟ Providers<span>{totalProviders}</span>
            </button>
          </div>

          {activeTab === 'services' && (
            <div className="management-card">
              <div className="table-toolbar">
                <div>
                  <span className="toolbar-label">SERVICE CATEGORIES</span>
                  <h3>All Services</h3>
                </div>
                <div className="toolbar-controls">
                  <div className="search-input">
                    <span>⌕</span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search categories..."
                    />
                  </div>
                  <button
                    type="button"
                    className="toolbar-add"
                    onClick={openCategoryModal}
                  >
                    ＋ Add Category
                  </button>
                </div>
              </div>
              <div className="advanced-table-wrapper table-wrap">
                <table className="advanced-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>ID</th>
                      <th>Providers</th>
                      <th>Status</th>
                      <th>Coverage</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && filteredCategories.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-table">
                          <div>
                            <span>◆</span>
                            <strong>No service categories</strong>
                            <small>
                              Create your first category to get started.
                            </small>
                            <button type="button" onClick={openCategoryModal}>
                              ＋ Create Category
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {filteredCategories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <div className="entity-cell">
                            <div className="entity-avatar purple">
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{category.name}</strong>
                              <small>Service category</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="code-chip">{category.id}</span>
                        </td>
                        <td>
                          <span className="number-chip">
                            {category.providers} providers
                          </span>
                        </td>
                        <td>
                          <span className="active-status">
                            <span />
                            Active
                          </span>
                        </td>
                        <td>
                          <div className="mini-progress">
                            <div>
                              <span
                                style={{
                                  width: `${Math.min(100, category.providers * 25)}%`,
                                }}
                              />
                            </div>
                            <small>
                              {Math.min(100, category.providers * 25)}%
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="row-buttons">
                            <button
                              type="button"
                              title="View providers"
                              onClick={() => {
                                setActiveTab('providers');
                                setCategoryFilter(category.id);
                              }}
                            >
                              ↗
                            </button>
                            <button
                              type="button"
                              title="Add provider"
                              onClick={() => openProviderModal(category.id)}
                            >
                              ♟
                            </button>
                            <button
                              type="button"
                              className="danger"
                              title="Delete category"
                              onClick={() =>
                                void handleDeleteCategory(category.id)
                              }
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="management-card">
              <div className="table-toolbar">
                <div>
                  <span className="toolbar-label">SERVICE PROVIDERS</span>
                  <h3>Provider Network</h3>
                </div>
                <div className="toolbar-controls">
                  <div className="search-input">
                    <span>⌕</span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search providers..."
                    />
                  </div>
                  <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="toolbar-add blue"
                    onClick={() => openProviderModal()}
                  >
                    ＋ Add Provider
                  </button>
                </div>
              </div>
              <div className="advanced-table-wrapper table-wrap">
                <table className="advanced-table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && filteredProviders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="empty-table">
                          <div>
                            <span>♟</span>
                            <strong>No providers found</strong>
                            <small>Add your first service provider.</small>
                            <button
                              type="button"
                              onClick={() => openProviderModal()}
                            >
                              ＋ Add Provider
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {filteredProviders.map((provider) => (
                      <tr key={provider.id}>
                        <td>
                          <div className="entity-cell">
                            <div className="entity-avatar blue">
                              {provider.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{provider.name}</strong>
                              <small>Professional provider</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="plain-value">{provider.phone}</span>
                        </td>
                        <td>
                          <span className="category-chip">
                            {catName(provider.categoryId)}
                          </span>
                        </td>
                        <td>
                          <span className="active-status">
                            <span />
                            Active
                          </span>
                        </td>
                        <td>
                          <div className="row-buttons">
                            <button
                              type="button"
                              title="Delete"
                              className="danger"
                              onClick={() =>
                                void handleDeleteProvider(provider.id)
                              }
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <footer className="service-footer">
          <div>
            <i>◆</i>
            Service Management Platform
          </div>
          <div>Secure • Reliable • Connected</div>
        </footer>
      </main>
    </div>
  );
}
