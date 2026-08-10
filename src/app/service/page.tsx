'use client';

import Link from 'next/link';
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

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
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      /*
       * LOCAL:
       * API_URL = ''
       * => /api/categories
       * => /api/members
       *
       * PRODUCTION:
       * NEXT_PUBLIC_API_URL=https://your-backend-domain.com
       * => https://your-backend-domain.com/api/categories
       * => https://your-backend-domain.com/api/members
       */

      const categoriesUrl = `${API_URL}/api/categories`;
      const membersUrl = `${API_URL}/api/members`;

      console.log('SERVICE API URL:', {
        API_URL,
        categoriesUrl,
        membersUrl,
      });

      const [categoryRes, providerRes] =
        await Promise.all([
          fetch(categoriesUrl, {
            method: 'GET',
            cache: 'no-store',
          }),

          fetch(membersUrl, {
            method: 'GET',
            cache: 'no-store',
          }),
        ]);

      console.log(
        'Categories status:',
        categoryRes.status,
      );

      console.log(
        'Members status:',
        providerRes.status,
      );

      if (!categoryRes.ok) {
        throw new Error(
          `Categories API failed: ${categoryRes.status}`,
        );
      }

      if (!providerRes.ok) {
        throw new Error(
          `Members API failed: ${providerRes.status}`,
        );
      }

      const categoryData =
        await categoryRes.json();

      const providerData =
        await providerRes.json();

      console.log(
        'Categories response:',
        categoryData,
      );

      console.log(
        'Members response:',
        providerData,
      );

      const categoryList = Array.isArray(categoryData)
        ? categoryData
        : categoryData?.categories || [];

      const providerList = Array.isArray(providerData)
        ? providerData
        : providerData?.members ||
          providerData?.providers ||
          [];

      setCategories(
<<<<<<< HEAD
        categoryList.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? ''),
          name:
            String(item.name || item.category || 'Service'),
          count: Number(
=======
        categoryList.map((item: any) => ({
          id: item.id,

          name:
            item.name ||
            item.category ||
            'Service',

          count:
>>>>>>> 3b711da (chnage)
            item.count ||
              item.providers_count ||
              0,
          ),
        })),
      );

      setProviders(
        providerList.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? ''),

          name: String(
            item.name ||
              item.full_name ||
              item.member_name ||
              'Service Professional',
          ),

          phone: String(
            item.phone ||
              item.mobile ||
              item.mobile_number ||
              '',
          ),

          mobile: String(
            item.mobile ||
              item.mobile_number ||
              item.phone ||
              '',
          ),

          category: String(
            item.category ||
              item.category_name ||
              '',
          ),

          category_id: String(
            item.category_id ||
              item.categoryId ||
              '',
          ),

          categoryId: String(
            item.categoryId ||
              item.category_id ||
              '',
          ),
        })),
      );
    } catch (error: any) {
      console.error(
        'Service data loading error:',
        error,
      );

      setError(
        error?.message ||
          'Unable to load service directory.',
      );

      setCategories([]);
      setProviders([]);
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
          selectedCategoryObject?.name
            ?.toLowerCase() || '';

        return (
          String(providerCategoryId) ===
            String(selectedCategory) ||
          providerCategory === selectedCategoryName
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
            .includes(query) ||
          provider.mobile
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
      name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || 'S'
    );
  }

  return (
    <main className="service-page">

      {/* ================= HEADER ================= */}

      <header className="service-header">
        <div className="service-header-inner">

          <Link
            href="/"
            className="service-brand"
          >
            <div className="brand-logo">
              ✦
            </div>

            <div className="brand-content">
              <strong>
                AmbalNagar
              </strong>

              <span>
                Community Services
              </span>
            </div>
          </Link>

          <nav className="service-navigation">

            <Link href="/">
              Home
            </Link>

            <Link
              href="/service"
              className="active"
            >
              Services
            </Link>

            <Link href="/events">
              Events
            </Link>

            <Link href="/newslist">
              News
            </Link>

          </nav>

          <Link
            href="/"
            className="header-home"
          >
            Home
          </Link>

        </div>
      </header>

      {/* ================= HERO ================= */}

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
              Discover trusted service
              professionals from our community
              and contact them directly.
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

      {/* ================= DIRECTORY ================= */}

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
              Choose a category or search
              for a service.
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

        {/* ================= ERROR ================= */}

        {error && (
          <div className="service-error">

            <div className="service-error-icon">
              !
            </div>

            <div>
              <strong>
                Unable to load services
              </strong>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadData}
              >
                Try Again
              </button>
            </div>

          </div>
        )}

        {/* ================= CATEGORY ================= */}

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
                  {providers.length}
                  {' '}
                  Professionals
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
                    {category.count || 0}
                    {' '}
                    Professionals
                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

        {/* ================= PROFESSIONALS ================= */}

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
              {filteredProviders.length}
              {' '}
              Available
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
                (provider, index) => {

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
                      key={
                        provider.id ??
                        `${name}-${index}`
                      }
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
                          {phone ||
                            'Not Available'}
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

        {/* ================= FOOTER ================= */}

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