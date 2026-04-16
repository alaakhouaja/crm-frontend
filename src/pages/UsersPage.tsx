import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { AuthUser, PaginatedResponse, UserRole } from '../types';

const roles: UserRole[] = ['ADMIN', 'SALES', 'MARKETING', 'EXECUTIVE'];

export function UsersPage() {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [, setLoading] = useState(true);

  // Formulaire User
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api<PaginatedResponse<AuthUser>>(`/users?page=${page}&limit=10`, { token });
      if (res) {
        setUsers(res.data);
        setLastPage(res.lastPage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreateUser(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      await api<AuthUser>('/users', {
        method: 'POST',
        token,
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          role,
        }),
      });
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('SALES');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible');
    }
  }

  async function onDeleteUser(id: string) {
    if (!token || !window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE', token });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Suppression impossible');
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Utilisateurs</h1>
          <p className="muted">Gestion des accès (Admin uniquement)</p>
        </div>
        <div className="actions">
          <button type="button" onClick={() => void load()}>Actualiser</button>
          <button type="button" className="secondary" onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Nouvel utilisateur</h2>
        <form className="grid-form" onSubmit={onCreateUser}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Mot de passe
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </label>
          <label>
            Prénom
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label>
            Nom
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
          <label>
            Rôle
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <div className="actions align-end">
            <button type="submit">Créer</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Liste des utilisateurs</h2>
        {error && <p className="error">{error}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.firstName} {u.lastName}</strong><br/>
                    <span className="muted small">{u.email}</span>
                  </td>
                  <td><span className="badge">{u.role}</span></td>
                  <td className="muted small">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="secondary small" onClick={() => onDeleteUser(u.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
          <span>Page {page} sur {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>Suivant</button>
        </div>
      </section>
    </div>
  );
}
