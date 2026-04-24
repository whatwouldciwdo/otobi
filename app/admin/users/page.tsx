"use client";

import { useEffect, useState } from "react";
import { useShop } from "../../context/ShopContext";
import styles from "./AdminUsers.module.css";
import {
    FiUsers, FiEdit2, FiTrash2, FiX, FiCheck, FiSearch,
    FiShield, FiUser, FiMail, FiPhone, FiCalendar, FiPlus
} from "react-icons/fi";

type UserRole = "USER" | "ADMIN";
type FilterRole = "ALL" | UserRole;

interface UserRow {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: UserRole;
    createdAt: string;
}

export default function AdminUsers() {
    const { user } = useShop();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<FilterRole>("ALL");
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Form states
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState<UserRole>("USER");
    const [editPassword, setEditPassword] = useState("");
    
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    const fetchUsers = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?userId=${user.id}`);
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user]);

    const startEdit = (u: UserRow) => {
        setIsCreating(false);
        setEditingUser(u);
        setEditName(u.name ?? "");
        setEditEmail(u.email);
        setEditRole(u.role);
        setEditPassword("");
        setSaveMsg("");
    };

    const startCreate = () => {
        setEditingUser(null);
        setIsCreating(true);
        setEditName("");
        setEditEmail("");
        setEditRole("USER");
        setEditPassword("");
        setSaveMsg("");
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setIsCreating(false);
        setSaveMsg("");
    };

    const handleSave = async () => {
        if (!user) return;
        
        if (isCreating) {
            if (!editEmail || !editPassword) {
                setSaveMsg("Email dan Password wajib diisi untuk pengguna baru.");
                return;
            }
        } else if (!editingUser) {
            return;
        }

        setSaving(true);
        setSaveMsg("");
        
        try {
            const method = isCreating ? "POST" : "PUT";
            const body = isCreating 
                ? {
                    userId: user.id,
                    name: editName,
                    email: editEmail,
                    role: editRole,
                    password: editPassword,
                }
                : {
                    userId: user.id,
                    targetId: editingUser!.id,
                    name: editName,
                    role: editRole,
                    password: editPassword || undefined,
                };

            const res = await fetch("/api/admin/users", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            
            if (res.ok) {
                setSaveMsg("Berhasil disimpan!");
                await fetchUsers();
                setTimeout(() => {
                    cancelEdit();
                }, 1000);
            } else {
                setSaveMsg(data.error ?? "Terjadi kesalahan.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (targetId: string, targetEmail: string) => {
        if (!user) return;
        if (targetId === user.id) {
            alert("Tidak bisa menghapus akun Anda sendiri.");
            return;
        }
        if (!confirm(`Hapus user "${targetEmail}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        const res = await fetch(`/api/admin/users?userId=${user.id}&targetId=${targetId}`, { method: "DELETE" });
        if (res.ok) {
            await fetchUsers();
            if (editingUser?.id === targetId) cancelEdit();
        } else {
            const data = await res.json();
            alert(data.error ?? "Gagal menghapus.");
        }
    };

    const filteredUsers: UserRow[] = (users as UserRow[]).filter((u: UserRow) => {
        const matchRole = filterRole === "ALL" || (u.role as string) === (filterRole as string);
        const matchSearch =
            (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });

    // Extracted before JSX to avoid TypeScript narrowing editingUser to null in the else branch,
    // which incorrectly collapses u to never when comparing editingUser?.id === u.id
    const editingUserId: string | null = editingUser ? editingUser.id : null;

    if (loading) return <div className={styles.loading}>Memuat data pengguna...</div>;

    return (
        <div className={styles.pageContainer}>
            {/* Hero */}
            {!editingUser && !isCreating && (
                <section className={styles.hero}>
                    <div className={styles.bgGlow} />
                    <div>
                        <span className={styles.heroBadge}>User management</span>
                        <h1>Kelola pengguna Otobi.</h1>
                        <p>Lihat, edit role, buat akun baru, atau hapus akun pengguna yang terdaftar di platform.</p>
                    </div>
                    <div className={styles.heroStats}>
                        <div className={styles.statItem}>
                            <strong>{users.length}</strong>
                            <span>Total User</span>
                        </div>
                        <div className={styles.statItem}>
                            <strong>{users.filter(u => u.role === "ADMIN").length}</strong>
                            <span>Admin</span>
                        </div>
                        <div className={styles.statItem}>
                            <strong>{users.filter(u => u.role === "USER").length}</strong>
                            <span>Customer</span>
                        </div>
                    </div>
                </section>
            )}

            <div className={styles.workspace}>
                {(editingUser || isCreating) ? (
                    /* Editor Panel */
                    <div className={styles.editorPanelFull}>
                        <div className={styles.editorHeader}>
                            <span className={styles.panelEyebrow}>{isCreating ? "New user" : "User editor"}</span>
                            <h2>{isCreating ? "Tambah Pengguna Baru" : "Edit Pengguna"}</h2>
                        </div>

                        <div className={styles.editorBody}>
                            {!isCreating && editingUser && (
                                <div className={styles.editorUserInfo}>
                                    <div className={`${styles.avatar} ${styles.avatarLg} ${editingUser.role === "ADMIN" ? styles.avatarAdmin : ""}`}>
                                        {(editingUser.name ?? editingUser.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <strong>{editingUser.name ?? "No name"}</strong>
                                        <p>{editingUser.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className={styles.fieldGroup}>
                                <label><FiUser /> Nama</label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Nama pengguna"
                                />
                            </div>

                            {isCreating && (
                                <div className={styles.fieldGroup}>
                                    <label><FiMail /> Email</label>
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        placeholder="Alamat email pengguna"
                                        required
                                    />
                                </div>
                            )}

                            <div className={styles.fieldGroup}>
                                <label><FiShield /> Role</label>
                                <div className={styles.roleSelect}>
                                    <button
                                        className={`${styles.roleBtn} ${editRole === "USER" ? styles.roleBtnActive : ""}`}
                                        onClick={() => setEditRole("USER")}
                                    >
                                        <FiUser /> Customer
                                    </button>
                                    <button
                                        className={`${styles.roleBtn} ${editRole === "ADMIN" ? styles.roleBtnActive : ""} ${styles.roleBtnAdmin}`}
                                        onClick={() => setEditRole("ADMIN")}
                                        disabled={!isCreating && editingUser?.id === user?.id}
                                    >
                                        <FiShield /> Admin
                                    </button>
                                </div>
                                {!isCreating && editingUser?.id === user?.id && (
                                    <p className={styles.selfWarning}>Tidak bisa mengubah role akun sendiri.</p>
                                )}
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Password {isCreating ? "" : "Baru "} <span className={styles.optionalLabel}>{isCreating ? "" : "(opsional)"}</span></label>
                                <input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder={isCreating ? "Password untuk pengguna baru" : "Kosongkan jika tidak diubah"}
                                    required={isCreating}
                                />
                            </div>

                            {saveMsg && (
                                <p className={saveMsg.includes("Berhasil") ? styles.successMsg : styles.errorMsg}>
                                    {saveMsg}
                                </p>
                            )}

                            <div className={styles.editorActions}>
                                <button className={styles.cancelBtn} onClick={cancelEdit}>
                                    <FiX /> Batal
                                </button>
                                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                    <FiCheck /> {saving ? "Menyimpan..." : "Simpan Pengguna"}
                                </button>
                            </div>

                            {!isCreating && editingUser && (
                                <div className={styles.dangerZone}>
                                    <p className={styles.dangerTitle}>Danger Zone</p>
                                    <button
                                        className={styles.deleteFullBtn}
                                        onClick={() => handleDelete(editingUser.id, editingUser.email)}
                                        disabled={editingUser.id === user?.id}
                                    >
                                        <FiTrash2 /> Hapus Akun Ini
                                    </button>
                                    {editingUser.id === user?.id && (
                                        <p className={styles.selfWarning}>Tidak bisa menghapus akun sendiri.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Table panel */
                    <section className={styles.tablePanel}>
                        <div className={styles.panelHeader}>
                            <div style={{display: 'flex', gap: '16px', flex: 1}}>
                                <div className={styles.searchBox} style={{ flex: 1 }}>
                                    <FiSearch className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.filterTabs}>
                                {(["ALL", "ADMIN", "USER"] as FilterRole[]).map((role) => (
                                    <button
                                        key={role}
                                        className={`${styles.filterTab} ${filterRole === role ? styles.filterTabActive : ""}`}
                                        onClick={() => setFilterRole(role)}
                                    >
                                        {role === "ALL" ? "Semua" : role === "ADMIN" ? "Admin" : "Customer"}
                                    </button>
                                ))}
                                <button className={styles.addBtn} onClick={startCreate} style={{ marginLeft: "16px", background: "#cc0000", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                                    <FiPlus /> Add User
                                </button>
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Pengguna</th>
                                        <th>Email</th>
                                        <th>No. HP</th>
                                        <th>Role</th>
                                        <th>Bergabung</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className={styles.emptyCell}>
                                                <FiUsers />
                                                Tidak ada pengguna ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                    {filteredUsers.map((u: UserRow) => (
                                        <tr key={u.id} className={`${styles.row} ${editingUserId === u.id ? styles.rowActive : ""}`}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={`${styles.avatar} ${u.role === "ADMIN" ? styles.avatarAdmin : ""}`}>
                                                        {(u.name ?? u.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{u.name ?? <em className={styles.noName}>No name</em>}</span>
                                                    {u.id === user?.id && <span className={styles.youBadge}>Anda</span>}
                                                </div>
                                            </td>
                                            <td className={styles.emailCell}>{u.email}</td>
                                            <td className={styles.dimCell}>{u.phone ?? "—"}</td>
                                            <td>
                                                <span className={`${styles.roleBadge} ${u.role === "ADMIN" ? styles.roleBadgeAdmin : styles.roleBadgeUser}`}>
                                                    {u.role === "ADMIN" ? <FiShield /> : <FiUser />}
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className={styles.dimCell}>{formatDate(u.createdAt)}</td>
                                            <td>
                                                <div className={styles.actionBtns}>
                                                    <button
                                                        className={styles.editBtn}
                                                        onClick={() => startEdit(u)}
                                                        title="Edit user"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    {u.id !== user?.id && (
                                                        <button
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleDelete(u.id, u.email)}
                                                            title="Hapus user"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
