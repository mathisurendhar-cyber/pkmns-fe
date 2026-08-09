'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

type Tab = 'services' | 'providers';

interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
  providers: number;
}

interface Provider {
  id: number;
  name: string;
  phone: string;
  email: string;
  categoryId: number;
  status: 'Active' | 'Inactive';
}

const initialCategories: Category[] = [
  {
    id: 1,
    name: 'Police',
    code: 'POL-001',
    description: 'Public safety service',
    status: 'Active',
    providers: 3,
  },
  {
    id: 2,
    name: 'Healthcare',
    code: 'HLT-002',
    description: 'Medical assistance',
    status: 'Active',
    providers: 0,
  },
  {
    id: 3,
    name: 'Education',
    code: 'EDU-003',
    description: 'Education and learning',
    status: 'Active',
    providers: 0,
  },
];

const initialProviders: Provider[] = [
  {
    id: 1,
    name: 'City Police Department',
    phone: '+91 98765 43210',
    email: 'police@example.com',
    categoryId: 1,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Central Police Station',
    phone: '+91 98765 12345',
    email: 'central@example.com',
    categoryId: 1,
    status: 'Active',
  },
  {
    id: 3,
    name: 'District Police Office',
    phone: '+91 98765 67890',
    email: 'district@example.com',
    categoryId: 1,
    status: 'Active',
  },
];

export default function Page() {
  const [categories, setCategories] =
    useState<Category[]>(initialCategories);

  const [providers, setProviders] =
    useState<Provider[]>(initialProviders);

  const [activeTab, setActiveTab] =
    useState<Tab>('services');

  const [search, setSearch] = useState('');

  const [categoryFilter, setCategoryFilter] =
    useState('all');

  const [modal, setModal] = useState<
    'category' | 'provider' | null
  >(null);

  const [saving, setSaving] = useState(false);

  const [categoryName, setCategoryName] =
    useState('');

  const [categoryDescription, setCategoryDescription] =
    useState('');

  const [providerName, setProviderName] =
    useState('');

  const [providerPhone, setProviderPhone] =
    useState('');

  const [providerEmail, setProviderEmail] =
    useState('');

  const [providerCategory, setProviderCategory] =
    useState('');

  const [toast, setToast] = useState('');

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const resetModal = () => {
    setModal(null);

    setCategoryName('');
    setCategoryDescription('');

    setProviderName('');
    setProviderPhone('');
    setProviderEmail('');
    setProviderCategory('');

    setSaving(false);
  };

  const openCategoryModal = () => {
    setModal('category');
  };

  const openProviderModal = () => {
    if (categories.length === 0) {
      showToast(
        'Please create a service category first.',
      );
      return;
    }

    setProviderCategory(
      String(categories[0].id),
    );

    setModal('provider');
  };

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      showToast('Category name is required.');
      return;
    }

    setSaving(true);

    window.setTimeout(() => {
      const nextNumber =
        categories.length + 1;

      const code =
        `SRV-${String(nextNumber).padStart(3, '0')}`;

      const newCategory: Category = {
        id: Date.now(),
        name: categoryName.trim(),
        code,
        description:
          categoryDescription.trim() ||
          'Service category',
        status: 'Active',
        providers: 0,
      };

      setCategories((current) => [
        ...current,
        newCategory,
      ]);

      setSaving(false);

      resetModal();

      showToast(
        `${newCategory.name} category created successfully.`,
      );
    }, 500);
  };

  const handleCreateProvider = () => {
    if (!providerName.trim()) {
      showToast('Provider name is required.');
      return;
    }

    if (!providerPhone.trim()) {
      showToast('Phone number is required.');
      return;
    }

    if (!providerCategory) {
      showToast('Please select a category.');
      return;
    }

    setSaving(true);

    window.setTimeout(() => {
      const newProvider: Provider = {
        id: Date.now(),
        name: providerName.trim(),
        phone: providerPhone.trim(),
        email: providerEmail.trim(),
        categoryId: Number(providerCategory),
        status: 'Active',
      };

      setProviders((current) => [
        ...current,
        newProvider,
      ]);

      setCategories((current) =>
        current.map((category) =>
          category.id === Number(providerCategory)
            ? {
                ...category,
                providers:
                  category.providers + 1,
              }
            : category,
        ),
      );

      setSaving(false);

      resetModal();

      showToast(
        `${newProvider.name} added successfully.`,
      );
    }, 500);
  };

  const handleDeleteCategory = (
    categoryId: number,
  ) => {
    const category = categories.find(
      (item) => item.id === categoryId,
    );

    if (!category) return;

    if (category.providers > 0) {
      showToast(
        'Remove providers from this category first.',
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete ${category.name}?`,
    );

    if (!confirmed) return;

    setCategories((current) =>
      current.filter(
        (item) => item.id !== categoryId,
      ),
    );

    showToast(
      `${category.name} deleted successfully.`,
    );
  };

  const handleDeleteProvider = (
    providerId: number,
  ) => {
    const provider = providers.find(
      (item) => item.id === providerId,
    );

    if (!provider) return;

    const confirmed = window.confirm(
      `Delete ${provider.name}?`,
    );

    if (!confirmed) return;

    setProviders((current) =>
      current.filter(
        (item) => item.id !== providerId,
      ),
    );

    setCategories((current) =>
      current.map((category) =>
        category.id === provider.categoryId
          ? {
              ...category,
              providers: Math.max(
                0,
                category.providers - 1,
              ),
            }
          : category,
      ),
    );

    showToast(
      `${provider.name} deleted successfully.`,
    );
  };

  const totalProviders = providers.length;

  const unassignedCategories =
    categories.filter(
      (category) => category.providers === 0,
    ).length;

  const topCategory =
    categories.length > 0
      ? [...categories].sort(
          (a, b) => b.providers - a.providers,
        )[0]
      : null;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        category.code
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        category.description
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [categories, search]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const category = categories.find(
        (item) => item.id === provider.categoryId,
      );

      const matchesSearch =
        provider.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        provider.phone
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        provider.email
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        String(provider.categoryId) ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        category
      );
    });
  }, [
    providers,
    categories,
    search,
    categoryFilter,
  ]);

  return (
    <div className="service-shell">

      {/* Background */}
      <div className="service-background">
        <div className="grid-overlay" />
        <div className="glow glow-purple" />
        <div className="glow glow-blue" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="service-toast">
          <div className="toast-icon">✓</div>

          <div>
            <strong>Success</strong>
            <span>{toast}</span>
          </div>

          <button
            onClick={() => setToast('')}
          >
            ×
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              resetModal();
            }
          }}
        >
          <div className="service-modal">

            <div className="modal-top-line" />

            <div className="modal-header">

              <div className="modal-title-area">

                <div
                  className={
                    modal === 'category'
                      ? 'modal-icon purple'
                      : 'modal-icon blue'
                  }
                >
                  {modal === 'category'
                    ? '◆'
                    : '♟'}
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
                      : 'Register a professional provider and assign a service.'}
                  </p>
                </div>

              </div>

              <button
                className="modal-close"
                onClick={resetModal}
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              {modal === 'category' && (
                <>
                  <div className="form-group">
                    <label>
                      Category Name
                      <span>*</span>
                    </label>

                    <input
                      value={categoryName}
                      onChange={(event) =>
                        setCategoryName(
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Emergency Services"
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Description
                    </label>

                    <textarea
                      value={categoryDescription}
                      onChange={(event) =>
                        setCategoryDescription(
                          event.target.value,
                        )
                      }
                      placeholder="Describe this service category..."
                      rows={4}
                    />
                  </div>

                  <div className="form-info">
                    <span>◆</span>

                    <div>
                      <strong>
                        New category
                      </strong>

                      <small>
                        Providers can be assigned
                        after the category is created.
                      </small>
                    </div>
                  </div>
                </>
              )}

              {modal === 'provider' && (
                <>
                  <div className="form-group">
                    <label>
                      Provider Name
                      <span>*</span>
                    </label>

                    <input
                      value={providerName}
                      onChange={(event) =>
                        setProviderName(
                          event.target.value,
                        )
                      }
                      placeholder="e.g. City Police Department"
                      autoFocus
                    />
                  </div>

                  <div className="form-row">

                    <div className="form-group">
                      <label>
                        Phone Number
                        <span>*</span>
                      </label>

                      <input
                        value={providerPhone}
                        onChange={(event) =>
                          setProviderPhone(
                            event.target.value,
                          )
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Email
                      </label>

                      <input
                        type="email"
                        value={providerEmail}
                        onChange={(event) =>
                          setProviderEmail(
                            event.target.value,
                          )
                        }
                        placeholder="provider@example.com"
                      />
                    </div>

                  </div>

                  <div className="form-group">
                    <label>
                      Service Category
                      <span>*</span>
                    </label>

                    <select
                      value={providerCategory}
                      onChange={(event) =>
                        setProviderCategory(
                          event.target.value,
                        )
                      }
                    >
                      <option value="">
                        Select service category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="provider-preview">

                    <div className="preview-avatar">
                      {providerName
                        ? providerName
                            .charAt(0)
                            .toUpperCase()
                        : 'P'}
                    </div>

                    <div>
                      <span>
                        PROVIDER PREVIEW
                      </span>

                      <strong>
                        {providerName ||
                          'Provider name'}
                      </strong>

                      <small>
                        {providerCategory
                          ? categories.find(
                              (item) =>
                                item.id ===
                                Number(
                                  providerCategory,
                                ),
                            )?.name ||
                            'No category'
                          : 'No category selected'}
                      </small>
                    </div>

                  </div>
                </>
              )}

            </div>

            <div className="modal-footer">

              <button
                className="modal-cancel"
                onClick={resetModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
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
                ) : (
                  <>
                    {modal === 'category'
                      ? '◆ Create Category'
                      : '♟ Add Provider'}
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}

      <main className="service-layout">

        {/* Header */}
        <header className="service-header">

          <div className="service-brand">

            <div className="service-logo">
              ⚡
            </div>

            <div>
              <h1>
                Service Operations
              </h1>

              <p>
                Service category & provider
                management
              </p>
            </div>

          </div>

          <div className="header-actions">

            <div className="system-status">
              <span className="pulse-dot" />
              All systems operational
            </div>

            <button
              className="header-icon-button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                showToast(
                  'Workspace refreshed.',
                );
              }}
            >
              ↻
            </button>

            <Link
              href="/dashboard"
              className="dashboard-button"
            >
              ↗ Dashboard
            </Link>

          </div>

        </header>

        {/* Hero */}
        <section className="service-hero">

          <div className="hero-left">

            <div className="hero-label">
              <span />
              SERVICE MANAGEMENT PLATFORM
            </div>

            <h2>
              One workspace.
              <br />
              <strong>
                Every service connected.
              </strong>
            </h2>

            <p>
              Create service categories,
              register providers and manage
              your entire service network from
              one professional workspace.
            </p>

            <div className="hero-buttons">

              <button
                className="button-primary"
                onClick={openProviderModal}
              >
                ♟ Add Provider
              </button>

              <button
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
                  <span>
                    NETWORK HEALTH
                  </span>

                  <strong>
                    {unassignedCategories === 0
                      ? 'Excellent'
                      : 'Good'}
                  </strong>
                </div>

                <div className="health-icon">
                  ✦
                </div>

              </div>

              <div className="health-meter">
                <span
                  style={{
                    width: `${
                      categories.length
                        ? Math.max(
                            25,
                            100 -
                              (unassignedCategories /
                                categories.length) *
                                100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="network-metrics">

                <div>
                  <small>
                    Categories
                  </small>

                  <strong>
                    {categories.length}
                  </strong>
                </div>

                <div>
                  <small>
                    Providers
                  </small>

                  <strong>
                    {totalProviders}
                  </strong>
                </div>

                <div>
                  <small>
                    Unassigned
                  </small>

                  <strong>
                    {unassignedCategories}
                  </strong>
                </div>

              </div>

              <div className="network-footer">
                <i>●</i>
                Live workspace synchronized
              </div>

            </div>

          </div>

        </section>

        {/* KPI */}
        <section className="kpi-grid">

          <div className="kpi-card purple">

            <div className="kpi-icon">
              ◆
            </div>

            <div className="kpi-content">
              <span>
                Total Categories
              </span>

              <strong>
                {categories.length}
              </strong>

              <small>
                Active service categories
              </small>
            </div>

            <div className="kpi-decoration">
              ◆
            </div>

          </div>

          <div className="kpi-card blue">

            <div className="kpi-icon">
              ♟
            </div>

            <div className="kpi-content">
              <span>
                Total Providers
              </span>

              <strong>
                {totalProviders}
              </strong>

              <small>
                Registered professionals
              </small>
            </div>

            <div className="kpi-decoration">
              ♟
            </div>

          </div>

          <div className="kpi-card green">

            <div className="kpi-icon">
              ↗
            </div>

            <div className="kpi-content">
              <span>
                Top Category
              </span>

              <strong>
                {topCategory?.name || '—'}
              </strong>

              <small>
                {topCategory
                  ? `${topCategory.providers} providers`
                  : 'No providers'}
              </small>
            </div>

            <div className="kpi-decoration">
              ↗
            </div>

          </div>

          <div className="kpi-card orange">

            <div className="kpi-icon">
              !
            </div>

            <div className="kpi-content">
              <span>
                Needs Attention
              </span>

              <strong>
                {unassignedCategories}
              </strong>

              <small>
                Categories without providers
              </small>
            </div>

            <div className="kpi-decoration">
              !
            </div>

          </div>

        </section>

        {/* Workspace */}
        <section className="workspace">

          <div className="workspace-top">

            <div>
              <span className="workspace-label">
                MANAGEMENT CONSOLE
              </span>

              <h2>
                Service Workspace
              </h2>

              <p>
                Create, organize and manage
                services and providers.
              </p>
            </div>

            <div className="workspace-actions">

              <button
                className="small-action"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');

                  showToast(
                    'Filters cleared.',
                  );
                }}
              >
                ⟳ Reset
              </button>

              <button
                className="small-action primary"
                onClick={openCategoryModal}
              >
                ＋ Add Service
              </button>

            </div>

          </div>

          {/* Tabs */}
          <div className="workspace-tabs">

            <button
              className={
                activeTab === 'services'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveTab('services')
              }
            >
              ◆ Services
              <span>
                {categories.length}
              </span>
            </button>

            <button
              className={
                activeTab === 'providers'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveTab('providers')
              }
            >
              ♟ Providers
              <span>
                {totalProviders}
              </span>
            </button>

          </div>

          {/* SERVICES */}
          {activeTab === 'services' && (
            <div className="management-card">

              <div className="table-toolbar">

                <div>
                  <span className="toolbar-label">
                    SERVICE CATEGORIES
                  </span>

                  <h3>
                    All Services
                  </h3>
                </div>

                <div className="toolbar-controls">

                  <div className="search-input">
                    <span>⌕</span>

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search categories..."
                    />
                  </div>

                  <button
                    className="toolbar-add"
                    onClick={openCategoryModal}
                  >
                    ＋ Add Category
                  </button>

                </div>

              </div>

              <div className="advanced-table-wrapper">

                <table className="advanced-table">

                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Code</th>
                      <th>Providers</th>
                      <th>Status</th>
                      <th>Coverage</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredCategories.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="empty-table"
                        >
                          <div>
                            <span>
                              ◆
                            </span>

                            <strong>
                              No service categories
                            </strong>

                            <small>
                              Create your first
                              category to get
                              started.
                            </small>

                            <button
                              onClick={
                                openCategoryModal
                              }
                            >
                              ＋ Create Category
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filteredCategories.map(
                      (category) => (
                        <tr
                          key={category.id}
                        >

                          <td>
                            <div className="entity-cell">

                              <div className="entity-avatar purple">
                                {category.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {category.name}
                                </strong>

                                <small>
                                  {
                                    category.description
                                  }
                                </small>
                              </div>

                            </div>
                          </td>

                          <td>
                            <span className="code-chip">
                              {category.code}
                            </span>
                          </td>

                          <td>
                            <span className="number-chip">
                              {category.providers}{' '}
                              providers
                            </span>
                          </td>

                          <td>
                            <span className="active-status">
                              <span />
                              {category.status}
                            </span>
                          </td>

                          <td>
                            <div className="mini-progress">

                              <div>
                                <span
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      category.providers *
                                        25,
                                    )}%`,
                                  }}
                                />
                              </div>

                              <small>
                                {Math.min(
                                  100,
                                  category.providers *
                                    25,
                                )}
                                %
                              </small>

                            </div>
                          </td>

                          <td>
                            <div className="row-buttons">

                              <button
                                title="View providers"
                                onClick={() => {
                                  setActiveTab(
                                    'providers',
                                  );

                                  setCategoryFilter(
                                    String(
                                      category.id,
                                    ),
                                  );
                                }}
                              >
                                ↗
                              </button>

                              <button
                                title="Add provider"
                                onClick={() => {
                                  setProviderCategory(
                                    String(
                                      category.id,
                                    ),
                                  );

                                  setModal(
                                    'provider',
                                  );
                                }}
                              >
                                ♟
                              </button>

                              <button
                                className="danger"
                                title="Delete category"
                                onClick={() =>
                                  handleDeleteCategory(
                                    category.id,
                                  )
                                }
                              >
                                ×
                              </button>

                            </div>
                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

          {/* PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="management-card">

              <div className="table-toolbar">

                <div>
                  <span className="toolbar-label">
                    SERVICE PROVIDERS
                  </span>

                  <h3>
                    Provider Network
                  </h3>
                </div>

                <div className="toolbar-controls">

                  <div className="search-input">
                    <span>⌕</span>

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search providers..."
                    />
                  </div>

                  <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(
                        event.target.value,
                      )
                    }
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>

                  <button
                    className="toolbar-add blue"
                    onClick={openProviderModal}
                  >
                    ＋ Add Provider
                  </button>

                </div>

              </div>

              <div className="advanced-table-wrapper">

                <table className="advanced-table">

                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredProviders.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="empty-table"
                        >
                          <div>
                            <span>
                              ♟
                            </span>

                            <strong>
                              No providers found
                            </strong>

                            <small>
                              Add your first
                              service provider.
                            </small>

                            <button
                              onClick={
                                openProviderModal
                              }
                            >
                              ＋ Add Provider
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filteredProviders.map(
                      (provider) => {
                        const category =
                          categories.find(
                            (item) =>
                              item.id ===
                              provider.categoryId,
                          );

                        return (
                          <tr
                            key={provider.id}
                          >

                            <td>
                              <div className="entity-cell">

                                <div className="entity-avatar blue">
                                  {provider.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {provider.name}
                                  </strong>

                                  <small>
                                    Professional
                                    provider
                                  </small>
                                </div>

                              </div>
                            </td>

                            <td>
                              <span className="plain-value">
                                {provider.phone}
                              </span>
                            </td>

                            <td>
                              <span className="category-chip">
                                {category?.name ||
                                  'Unassigned'}
                              </span>
                            </td>

                            <td>
                              <span className="active-status">
                                <span />
                                {provider.status}
                              </span>
                            </td>

                            <td>
                              <span className="plain-value">
                                {provider.email ||
                                  '—'}
                              </span>
                            </td>

                            <td>
                              <div className="row-buttons">

                                <button
                                  title="View"
                                  onClick={() =>
                                    showToast(
                                      provider.name,
                                    )
                                  }
                                >
                                  ↗
                                </button>

                                <button
                                  title="Delete"
                                  className="danger"
                                  onClick={() =>
                                    handleDeleteProvider(
                                      provider.id,
                                    )
                                  }
                                >
                                  ×
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        </section>

        {/* Footer */}
        <footer className="service-footer">

          <div>
            <i>◆</i>
            Service Management Platform
          </div>

          <div>
            Secure • Reliable • Connected
          </div>

        </footer>

      </main>
    </div>
  );
}