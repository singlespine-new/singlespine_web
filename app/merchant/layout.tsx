'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-utils'
import { UIIcon, IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
    { href: '/merchant', label: 'Dashboard', icon: 'grid', exact: true },
    { href: '/merchant/products', label: 'Products', icon: 'package' },
    { href: '/merchant/orders', label: 'Orders', icon: 'shopping-bag' },
    { href: '/merchant/settings', label: 'Shop Settings', icon: 'settings' },
]

export default function MerchantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { user } = useAuth()

    // Registration page gets a clean layout (no sidebar)
    if (pathname === '/merchant/register') {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
                    <Link
                        href="/products"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <UIIcon name="chevron-left" className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Store</span>
                    </Link>

                    <div className="h-4 w-px bg-border/60" />

                    <div className="flex items-center gap-2">
                        <UIIcon name="building" className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-sm">Merchant Portal</span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                            {user?.name || user?.email}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-56 flex-col border-r border-border/40 bg-card/50 min-h-[calc(100vh-3.5rem)] sticky top-14">
                    <nav className="flex flex-col gap-1 p-3 pt-4">
                        {NAV_ITEMS.map(item => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    )}
                                >
                                    <UIIcon name={item.icon} className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Nav */}
                    <div className="lg:hidden flex gap-1 p-2 border-b border-border/40 bg-card/30 overflow-x-auto scrollbar-none">
                        {NAV_ITEMS.map(item => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <UIIcon name={item.icon} className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
