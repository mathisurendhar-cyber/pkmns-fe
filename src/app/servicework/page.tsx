'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './servicework.css';

interface Category {
  id: string;
  name: string;
}

interface Member {
  id?: string;
  name: string;
  phone: string;
  category: string;
}

export default function ServiceWorkPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'members'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Category Form State
  const [categoryId, setCategoryId] = useState('');
  const [categoryInputId, setCategoryInputId] = useState('');
  const [categoryInputName, setCategoryInputName] = useState('');

  // Member Form State
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberCategory, setMemberCategory] = useState('');

  // Auth Protection Check
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        window.location.replace('/login');
      }
    } catch (e) {
      console.error('Auth check error', e);
      window.location.replace('/login');
    }
  }, []);

  // Fetch Categories
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data: Category[] = await res.json();
        setCategories(data);
        if (data.length > 0 && !memberCategory) {
          setMemberCategory(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // Fetch Members
  const loadMembers = async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data: Member[] = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to load members', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await loadCategories();
      await loadMembers();
    };
    initData();
  }, []);

  // Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = categoryInputId.trim();
    const name = categoryInputName.trim();

    if (!id || !name) {
      alert('Category ID and Name are required.');
      return;
    }

    try {
      if (categoryId) {
        await fetch(`/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || 'Failed to add category');
          return;
        }
      }
      resetCategoryForm();
      await loadCategories();
    } catch (err) {
      console.error('Category save error', err);
    }
  };

  const resetCategoryForm = () => {
    setCategoryId('');
    setCategoryInputId('');
    setCategoryInputName('');
  };

  const handleEditCategory = (cat: Category) => {
    setCategoryId(cat.id);
    setCategoryInputId(cat.id);
    setCategoryInputName(cat.name);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category?')) {
      try {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        await loadCategories();
        await loadMembers();
      } catch (err) {
        console.error('Delete category error', err);
      }
    }
  };

  // Member Submit
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: memberName.trim(),
      phone: memberPhone.trim(),
      category: memberCategory || (categories[0]?.id || ''),
    };

    if (!body.name || !body.phone || !body.category) {
      alert('Please fill all member fields.');
      return;
    }

    try {
      if (memberId) {
        await fetch(`/api/members/${memberId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      resetMemberForm();
      await loadMembers();
    } catch (err) {
      console.error('Member save error', err);
    }
  };

  const resetMemberForm = () => {
    setMemberId('');
    setMemberName('');
    setMemberPhone('');
    if (categories.length > 0) setMemberCategory(categories[0].id);
  };

  const handleEditMember = (m: Member) => {
    if (m.id) setMemberId(m.id);
    setMemberName(m.name);
    setMemberPhone(m.phone);
    setMemberCategory(m.category);
  };

  const handleDeleteMember = async (id?: string) => {
    if (!id) return;
    if (confirm('Delete this member?')) {
      try {
        await fetch(`/api/members/${id}`, { method: 'DELETE' });
        await loadMembers();
      } catch (err) {
        console.error('Delete member error', err);
      }
    }
  };

  const getCategoryName = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : catId;
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="services-workspace">
        <div className="workspace-inner">
          {/* Header Console */}
          <div className="header-console">
            <div className="header-left-title">
              <h1>Services Management Console</h1>
              <p>Configure essential service categories and provider directory</p>
            </div>
            <div className="nav-actions">
              <Link href="/dashboard" className="btn-nav-back">
                <i className="fas fa-arrow-left"></i>
                <span>Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Interactive Workspace Tab Control Bar */}
          <div className="tabs-control-bar">
            <button
              className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <i className="fas fa-folder-open"></i>
              <span>Categories Management ({categories.length})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <i className="fas fa-address-book"></i>
              <span>Service Providers Directory ({members.length})</span>
            </button>
          </div>

          {/* TAB 1: CATEGORIES CONSOLE */}
          {activeTab === 'categories' && (
            <div className="console-panel">
              <div className="panel-header-toolbar">
                <div className="panel-title-text">
                  <i className="fas fa-folder-plus" style={{ color: '#06b6d4' }}></i>
                  <span>Manage Service Categories</span>
                </div>
                <span className="badge-count">Total: {categories.length} Categories</span>
              </div>

              {/* Inline Form Bar */}
              <div className="inline-form-panel">
                <form onSubmit={handleCategorySubmit}>
                  <div className="form-grid-row">
                    <div className="form-field-flex">
                      <label>Category ID</label>
                      <input
                        type="text"
                        className="input-console"
                        value={categoryInputId}
                        onChange={(e) => setCategoryInputId(e.target.value)}
                        placeholder="e.g. plumber, electrician"
                        required
                      />
                    </div>
                    <div className="form-field-flex">
                      <label>Category Name</label>
                      <input
                        type="text"
                        className="input-console"
                        value={categoryInputName}
                        onChange={(e) => setCategoryInputName(e.target.value)}
                        placeholder="e.g. Plumber, Electrician"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-action-submit">
                      <i className="fas fa-save"></i> Save Category
                    </button>
                    <button
                      type="button"
                      className="btn-action-cancel"
                      onClick={resetCategoryForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Data Table */}
              <div className="table-container-console">
                <table className="console-table">
                  <thead>
                    <tr>
                      <th>Category ID</th>
                      <th>Category Name</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                          No categories configured. Create one above!
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id}>
                          <td>
                            <span className="tag-id">{cat.id}</span>
                          </td>
                          <td style={{ fontWeight: 700 }}>{cat.name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn-icon-pill btn-edit-pill"
                              onClick={() => handleEditCategory(cat)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              className="btn-icon-pill btn-delete-pill"
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE MEMBERS CONSOLE */}
          {activeTab === 'members' && (
            <div className="console-panel">
              <div className="panel-header-toolbar">
                <div className="panel-title-text">
                  <i className="fas fa-user-shield" style={{ color: '#a855f7' }}></i>
                  <span>Manage Service Providers Directory</span>
                </div>
                <span className="badge-count">Total: {members.length} Providers</span>
              </div>

              {/* Inline Form Bar */}
              <div className="inline-form-panel">
                <form onSubmit={handleMemberSubmit}>
                  <div className="form-grid-row">
                    <div className="form-field-flex">
                      <label>Provider Name</label>
                      <input
                        type="text"
                        className="input-console"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        required
                      />
                    </div>

                    <div className="form-field-flex">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        className="input-console"
                        value={memberPhone}
                        onChange={(e) => setMemberPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                      />
                    </div>

                    <div className="form-field-flex">
                      <label>Assigned Category</label>
                      <select
                        className="select-console"
                        value={memberCategory}
                        onChange={(e) => setMemberCategory(e.target.value)}
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button type="submit" className="btn-action-submit">
                      <i className="fas fa-user-check"></i> Save Provider
                    </button>
                    <button
                      type="button"
                      className="btn-action-cancel"
                      onClick={resetMemberForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Members Data Table */}
              <div className="table-container-console">
                <table className="console-table">
                  <thead>
                    <tr>
                      <th>Provider Name</th>
                      <th>Phone Number</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                          No service providers registered.
                        </td>
                      </tr>
                    ) : (
                      members.map((m, idx) => (
                        <tr key={m.id || idx}>
                          <td style={{ fontWeight: 700 }}>{m.name}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.phone}</td>
                          <td>
                            <span className="tag-cat">{getCategoryName(m.category)}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn-icon-pill btn-edit-pill"
                              onClick={() => handleEditMember(m)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              className="btn-icon-pill btn-delete-pill"
                              onClick={() => handleDeleteMember(m.id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Floating Home Button */}
        <Link href="/" className="home-floating-btn" title="Go to Home">
          <i className="fas fa-home"></i>
        </Link>
      </div>
    </>
  );
}
