'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRequireAdmin } from '@/lib/auth-utils'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { UIIcon } from '@/components/ui/icon'
import DataEmptyState from '@/components/ui/DataEmptyState'
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminUser {
    id: string
    name: string | null
    email: string | null
    phoneNumber: string | null
    role: string
    image: string | null
    createdAt: string
    _count: { orders: number; shops: number }
}

const ROLES = ['USER', 'VENDOR', 'ADMIN']

const roleBadge = (role: string) => {
    const map: Record<string, string> = {
        ADMIN: 'bg-primary/10 text-primary',
        VENDOR: 'bg-emerald-500/10 text-emerald-600',
        USER: 'bg-muted text-muted-foreground',
    }
    return map[role] || map.USER
}

export default function AdminUsersPage() {
    const { isLoading: authLoading, isAdmin } = useRequireAdmin()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (roleFilter) params.set('role', roleFilter)
            params.set('page', String(pagination.page))

            const res = await fetch(`/api/admin/users?${params}`)
            const data = await res.json()
            if (data.success) {
                setUsers(data.data.users)
                setPagination(data.data.pagination)
            }
        } catch { toast.error('Failed to load users') }
        finally { setLoading(false) }
    }, [search, roleFilter, pagination.page])

    useEffect(() => {
        if (isAdmin) fetchUsers()
    }, [isAdmin, fetchUsers])

    const changeRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            })
            if (res.ok) {
                toast.success(`Role updated to ${newRole}`)
                fetchUsers()
            } else { toast.error('Failed to update role') }
        } catch { toast.error('Network error') }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <UIIcon name="loading" className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                <p className="text-sm text-muted-foreground mt-1">{pagination.total} registered users</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchBar
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onSearch={setSearch}
                        variant="default"
                        size="sm"
                        clearButton
                    />
                </div>
                <div className="flex gap-2">
                    {['', ...ROLES].map(r => (
                        <button
                            key={r || 'all'}
                            onClick={() => { setRoleFilter(r); setPagination(p => ({ ...p, page: 1 })) }}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                                roleFilter === r
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                            )}
                        >
                            {r || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* User List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <UIIcon name="loading" className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <DataEmptyState
                    title="No users found"
                    description="Try adjusting your search or filters"
                    icon={{ name: 'user', tone: 'muted' }}
                    variant="card"
                    size="md"
                />
            ) : (
                <div className="grid gap-2">
                    {users.map(user => (
                        <div
                            key={user.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:shadow-sm transition-shadow"
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                {user.image ? (
                                    <Image src={user.image} alt={user.name || ''} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <UIIcon name="user" className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold truncate">{user.name || 'Unnamed'}</span>
                                    <span className={cn('px-1.5 py-0.5 text-[10px] rounded-md font-medium', roleBadge(user.role))}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {user.email && <span className="truncate">{user.email}</span>}
                                    {user.phoneNumber && <span>{user.phoneNumber}</span>}
                                    <span>{user._count.orders} orders</span>
                                    {user._count.shops > 0 && <span>{user._count.shops} shop{user._count.shops > 1 ? 's' : ''}</span>}
                                </div>
                            </div>

                            {/* Role Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Change user role">
                                        <UIIcon name="settings" className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {ROLES.map(role => (
                                        <DropdownMenuItem
                                            key={role}
                                            onClick={() => changeRole(user.id, role)}
                                            className={cn('text-sm', user.role === role && 'font-semibold text-primary')}
                                        >
                                            <UIIcon name={role === 'ADMIN' ? 'settings' : role === 'VENDOR' ? 'building' : 'user'} className="w-3.5 h-3.5 mr-2" />
                                            Set as {role}
                                            {user.role === role && <UIIcon name="success" className="w-3 h-3 ml-auto text-primary" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                            className={cn(
                                'w-8 h-8 rounded-lg text-xs font-medium transition',
                                p === pagination.page ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
