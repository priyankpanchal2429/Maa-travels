'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/Toast/Toast';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Modal from '@/components/ui/Modal/Modal';
import Spinner from '@/components/ui/Spinner/Spinner';
import authService from '@/services/authService';
import { AuthUser } from '@/types/auth.types';
import styles from './page.module.css';

interface CreateUserForm { name: string; role: 'admin' | 'driver' | 'staff'; tempPassword: string; }
interface ResetForm { newTempPassword: string; }

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toasts, show, dismiss } = useToast();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<AuthUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [createForm, setCreateForm] = useState<CreateUserForm>({ name: '', role: 'staff', tempPassword: '' });
  const [resetForm, setResetForm] = useState<ResetForm>({ newTempPassword: '' });

  // Guard: non-admins get bounced
  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/');
  }, [user, router]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await authService.listUsers();
      setUsers(data.data);
    } catch {
      show('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.tempPassword) { show('All fields are required', 'error'); return; }
    setActionLoading(true);
    try {
      const { data } = await authService.createUser(createForm);
      show(`User created! User ID: ${data.data.user.userId}`, 'success');
      setCreateOpen(false);
      setCreateForm({ name: '', role: 'staff', tempPassword: '' });
      fetchUsers();
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Failed to create user', 'error');
    } finally { setActionLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetForm.newTempPassword || resetForm.newTempPassword.length < 8) {
      show('Password must be at least 8 characters', 'error'); return;
    }
    setActionLoading(true);
    try {
      await authService.resetUserPassword(resetTarget!.userId, resetForm.newTempPassword);
      show(`Password reset for ${resetTarget!.name}`, 'success');
      setResetTarget(null);
      setResetForm({ newTempPassword: '' });
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Failed to reset password', 'error');
    } finally { setActionLoading(false); }
  };

  const handleToggleActive = async (u: AuthUser) => {
    try {
      await authService.toggleUserActive(u.userId);
      show(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`, 'success');
      fetchUsers();
    } catch { show('Action failed', 'error'); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await authService.deleteUser(deleteTarget!.userId);
      show('User deleted', 'success');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Failed to delete user', 'error');
    } finally { setActionLoading(false); }
  };

  const ROLES = ['admin', 'driver', 'staff'] as const;

  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>User Management</h1>
            <p className={styles.subtitle}>{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }>
            Add User
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className={styles.loading}><Spinner size="lg" /></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User ID</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={!u.isActive ? styles.inactiveRow : ''}>
                    <td><code className={styles.userId}>{u.userId}</code></td>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.smallAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                        <span>{u.name}</span>
                        {u.mustChangePassword && <span className={styles.badge}>Must change pw</span>}
                      </div>
                    </td>
                    <td><span className={[styles.rolePill, styles[u.role]].join(' ')}>{u.role}</span></td>
                    <td>
                      <span className={[styles.statusDot, u.isActive ? styles.active : styles.inactive].join(' ')}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => { setResetTarget(u); setResetForm({ newTempPassword: '' }); }} title="Reset password">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                          </svg>
                        </button>
                        <button
                          className={[styles.actionBtn, u.isActive ? styles.deactivate : styles.activate].join(' ')}
                          onClick={() => handleToggleActive(u)}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          disabled={u.userId === user?.userId}
                        >
                          {u.isActive ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64A9 9 0 0 1 20.77 15M6.16 6.16a9 9 0 1 0 12.68 12.68"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="9 11 12 14 22 4"/></svg>
                          )}
                        </button>
                        <button
                          className={[styles.actionBtn, styles.delete].join(' ')}
                          onClick={() => setDeleteTarget(u)}
                          title="Delete user"
                          disabled={u.userId === user?.userId}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className={styles.empty}>No users found. Create one to get started.</div>
            )}
          </div>
        )}
      </div>

      {/* Create user modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New User"
        footer={<>
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button isLoading={actionLoading} onClick={handleCreate as any}>Create User</Button>
        </>}
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input id="m-name" label="Full Name" placeholder="e.g. John Smith" value={createForm.name}
            onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '6px' }}>Role</label>
            <select className={styles.select} value={createForm.role}
              onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as any }))}>
              {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <Input id="m-pwd" label="Temporary Password" type="password" placeholder="Min. 8 characters"
            value={createForm.tempPassword} hint="User will be forced to change this on first login."
            onChange={(e) => setCreateForm((p) => ({ ...p, tempPassword: e.target.value }))} />
        </form>
      </Modal>

      {/* Reset password modal */}
      <Modal isOpen={!!resetTarget} onClose={() => setResetTarget(null)}
        title={`Reset Password — ${resetTarget?.name}`}
        footer={<>
          <Button variant="secondary" onClick={() => setResetTarget(null)}>Cancel</Button>
          <Button isLoading={actionLoading} onClick={handleReset as any}>Reset Password</Button>
        </>}
      >
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input id="r-pwd" label="New Temporary Password" type="password" placeholder="Min. 8 characters"
            value={resetForm.newTempPassword} hint="User will be forced to change this on next login."
            onChange={(e) => setResetForm({ newTempPassword: e.target.value })} />
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" isLoading={actionLoading} onClick={handleDelete}>Delete</Button>
        </>}
      >
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--color-text)' }}>{deleteTarget?.name}</strong> ({deleteTarget?.userId})?
          This action cannot be undone.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
