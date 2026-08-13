'use client';

import { apiFetch } from '@/lib/api';
import SiteNavbar from '@/components/layout/SiteNavbar';
import { useEffect, useMemo, useState } from 'react';
import './service.css';

type Category = {
  id: number | string;
  name: string;
  count?: number;
};

type Provider = {
  id?: number | string;
  name: string;
  phone?: string;
  mobile?: string;
  category?: string;
  category_id?: number | string;
  categoryId?: number | string;
};

const categoryIcons: Record<string, string> = {
  police: '🛡',
  'forest department': '🌿',
  taxi: '🚕',
  'fire service': '🔥',
  electrician: '⚡',
  plumber: '🔧',
  'house made': '⌂',
  gas: '◈',
  'cm cell': '▣',
  mechanic: '⚙',
  car_service: '◆',
  'corporation department': '▦',
};

export default function ServicePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>('all');

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  /*
   * NO AUTH CHECK HERE
   * Service page is public.
   */
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      /*
       * EXISTING BACKEND API
       * DO NOT CHANGE
       */
      const [categoryRes, providerRes] = await Promise.all([
        apiFetch('/api/categories', {
          cache: 'no-store',
        }),
        apiFetch('/api/members', {
          cache: 'no-store',
        }),
      ]);

      const categoryData = await categoryRes.json();
      const providerData = await providerRes.json();

      const categoryList = Array.isArray(categoryData)
        ? categoryData
        : categoryData?.categories || [];

      const providerList = Array.isArray(providerData)
        ? providerData
        : providerData?.members ||
          providerData?.providers ||
          [];

      setCategories(
        categoryList.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? ''),
          name: String(item.name || item.category || 'Service'),
          count: Number(item.count || item.providers_count || 0),
        })),
      );

      const mappedProviders = providerList.map(
        (item: Record<string, unknown>) => ({
          id: String(item.id ?? ''),
          name: String(
            item.name ||
              item.full_name ||
              item.member_name ||
              'Service Professional',
          ),
          phone: String(
            item.phone || item.mobile || item.mobile_number || '',
          ),
          mobile: String(
            item.mobile || item.mobile_number || item.phone || '',
          ),
          category: String(item.category || item.category_name || ''),
          category_id: String(
            item.category_id || item.categoryId || item.category || '',
          ),
          categoryId: String(
            item.categoryId || item.category_id || item.category || '',
          ),
        }),
      );

      setProviders(mappedProviders);

      // Recompute counts from providers when API count is 0
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.count && cat.count > 0) return cat;
          const count = mappedProviders.filter((p) => {
            const value = (p.category || p.category_id || '').toLowerCase();
            return (
              value === cat.id.toLowerCase() ||
              value === cat.name.toLowerCase()
            );
          }).length;
          return { ...cat, count };
        }),
      );
    } catch (error) {
      console.error(
        'Service data loading error:',
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredProviders = useMemo(() => {
    let result = [...providers];

    /*
     * CATEGORY FILTER
     */
    if (selectedCategory !== 'all') {
      result = result.filter((provider) => {
        const providerCategoryId =
          provider.category_id ||
          provider.categoryId;

        const providerCategory =
          provider.category?.toLowerCase() || '';

        const selectedCategoryObject =
          categories.find(
            (category) =>
              String(category.id) ===
              String(selectedCategory),
          );

        const selectedCategoryName =
          selectedCategoryObject?.name?.toLowerCase() ||
          '';

        return (
          String(providerCategoryId) === String(selectedCategory) ||
          providerCategory === selectedCategoryName ||
          providerCategory === String(selectedCategory).toLowerCase() ||
          providerCategory === selectedCategoryName.replace(/\s+/g, '_')
        );
      });
    }

    /*
     * SEARCH FILTER
     */
    if (search.trim()) {
      const query =
        search.trim().toLowerCase();

      result = result.filter((provider) => {
        return (
          provider.name
            ?.toLowerCase()
            .includes(query) ||
          provider.category
            ?.toLowerCase()
            .includes(query) ||
          provider.phone
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    return result;
  }, [
    providers,
    categories,
    selectedCategory,
    search,
  ]);

  function getIcon(name: string) {
    return (
      categoryIcons[
        name.toLowerCase().trim()
      ] || '✦'
    );
  }

  function getInitial(name: string) {
    return (
      name?.trim()?.charAt(0)?.toUpperCase() ||
      'S'
    );
  }

  return (
    <main className="service-page">
      <SiteNavbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="service-intro">

        <div className="intro-container">

          <div className="intro-left">

            <div className="intro-tag">
              COMMUNITY SERVICE DIRECTORY
            </div>

            <h1>
              Local Services,
              <span>
                Right When You Need Them.
              </span>
            </h1>

            <p>
              Discover trusted service professionals
              from our community and contact them
              directly.
            </p>

            <div className="hero-search">

              <span className="hero-search-icon">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by service, professional or phone..."
              />

              {search && (
                <button
                  type="button"
                  className="hero-clear"
                  onClick={() =>
                    setSearch('')
                  }
                >
                  ×
                </button>
              )}

            </div>

          </div>

          <div className="intro-right">

            <div className="intro-stat">

              <div className="intro-stat-icon orange">
                ▦
              </div>

              <strong>
                {categories.length}
              </strong>

              <span>
                Service Categories
              </span>

            </div>

            <div className="intro-stat">

              <div className="intro-stat-icon blue">
                ♙
              </div>

              <strong>
                {providers.length}
              </strong>

              <span>
                Professionals
              </span>

            </div>

            <div className="intro-stat">

              <div className="intro-stat-icon green">
                ☎
              </div>

              <strong>
                24/7
              </strong>

              <span>
                Direct Contact
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DIRECTORY
      ===================================================== */}

      <section className="directory-section">

        <div className="directory-header">

          <div>

            <div className="section-label">
              SERVICE DIRECTORY
            </div>

            <h2>
              Find the right professional
            </h2>

            <p>
              Choose a category or search for a service.
            </p>

          </div>

          <div className="result-badge">

            <strong>
              {filteredProviders.length}
            </strong>

            <span>
              Results
            </span>

          </div>

        </div>

        {/* =====================================================
            CATEGORY
        ===================================================== */}

        <div className="category-section">

          <div className="section-heading">

            <div>

              <div className="section-label">
                EXPLORE
              </div>

              <h3>
                Categories
              </h3>

            </div>

            {selectedCategory !== 'all' && (
              <button
                type="button"
                className="clear-filter"
                onClick={() =>
                  setSelectedCategory('all')
                }
              >
                Clear Filter
              </button>
            )}

          </div>

          {loading ? (
            <div className="loading-box">
              Loading categories...
            </div>
          ) : (
            <div className="category-grid">

              <button
                type="button"
                className={`category-card ${
                  selectedCategory === 'all'
                    ? 'selected'
                    : ''
                }`}
                onClick={() =>
                  setSelectedCategory('all')
                }
              >

                <div className="category-icon all">
                  ✦
                </div>

                <strong>
                  All Services
                </strong>

                <span>
                  {providers.length} Professionals
                </span>

              </button>

              {categories.map((category) => (

                <button
                  type="button"
                  key={category.id}
                  className={`category-card ${
                    String(selectedCategory) ===
                    String(category.id)
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedCategory(
                      String(category.id),
                    )
                  }
                >

                  <div className="category-icon">
                    {getIcon(category.name)}
                  </div>

                  <strong>
                    {category.name}
                  </strong>

                  <span>
                    {category.count || 0} Professionals
                  </span>

                </button>

              ))}

            </div>
          )}

        </div>

        {/* =====================================================
            PROFESSIONALS
        ===================================================== */}

        <div className="professionals-section">

          <div className="section-heading">

            <div>

              <div className="section-label">
                DIRECTORY
              </div>

              <h3>
                Community Professionals
              </h3>

            </div>

            <span className="available-count">
              {filteredProviders.length} Available
            </span>

          </div>

          {loading ? (

            <div className="loading-box">
              Loading professionals...
            </div>

          ) : filteredProviders.length === 0 ? (

            <div className="empty-box">

              <div className="empty-icon">
                ⌕
              </div>

              <h3>
                No professionals found
              </h3>

              <p>
                Try another search or select
                another category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
              >
                Reset Search
              </button>

            </div>

          ) : (

            <div className="professional-grid">

              {filteredProviders.map(
                (provider) => {

                  const name =
                    provider.name ||
                    'Service Professional';

                  const phone =
                    provider.phone ||
                    provider.mobile ||
                    '';

                  const category =
                    provider.category ||
                    'Community Service';

                  return (

                    <article
                      className="professional-card"
                      key={provider.id}
                    >

                      <div className="professional-top">

                        <div className="professional-avatar">
                          {getInitial(name)}
                        </div>

                        <div className="professional-details">

                          <h4>
                            {name}
                          </h4>

                          <span>
                            {category}
                          </span>

                        </div>

                      </div>

                      <div className="professional-line" />

                      <div className="phone-row">

                        <span>
                          PHONE
                        </span>

                        <strong>
                          {phone || 'Not Available'}
                        </strong>

                      </div>

                      {phone && (

                        <a
                          href={`tel:${phone}`}
                          className="contact-btn"
                        >
                          <span>
                            ☎
                          </span>

                          Contact Professional

                        </a>

                      )}

                    </article>

                  );
                },
              )}

            </div>

          )}

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="service-footer">

          <div className="footer-icon">
            ✓
          </div>

          <div>

            <strong>
              Need a local service?
            </strong>

            <p>
              Browse the directory and connect
              directly with a community professional.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}