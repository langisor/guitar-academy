'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'

interface MenuItem {
    id: number
  label: string
  href?: string
  items?: MenuItem[]
}

interface ResponsiveMenuProps {
  items: MenuItem[]
}

export function ResponsiveMenu({ items }: ResponsiveMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Desktop Menu */}
      <nav className="hidden md:flex gap-1">
        {items.map((item) => (
          <div key={item.label} className="relative group">
            {item.href && !item.items ? (
              <Link
                href={item.href}
                className="px-4 py-2 rounded-md bg-blue-800  hover:bg-text-foreground  text-sm font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <button className="px-4 py-2 rounded-md bg-blue-800 hover:bg-accent   text-sm font-medium flex items-center gap-1 group-hover:bg-accent">
                {item.label}
                {item.items && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
              </button>
            )}

            {/* Desktop Submenu */}
            {item.items && (
              <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="border border-border rounded-md shadow-lg py-1">
                  {item.items.map((subitem) => (
                    <Link
                      key={subitem.label}
                      href={subitem.href || '#'}
                      className="block px-4 py-2 text-sm hover:bg-text-foreground hover:bg-blue-800 transition-colors whitespace-nowrap"
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-card border-b border-border shadow-lg z-50">
          <div className="flex flex-col py-2">
            {items.map((item) => (
              <div key={item.label}>
                {item.href && !item.items ? (
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="px-4 py-3 hover:bg-accent transition-colors text-sm font-medium block"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className="w-full px-4 py-3 hover:bg-accent transition-colors text-sm font-medium flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedItems.has(item.label) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Mobile Submenu */}
                    {item.items && expandedItems.has(item.label) && (
                      <div className="bg-muted/50 flex flex-col">
                        {item.items.map((subitem) => (
                          <Link
                            key={subitem.label}
                            href={subitem.href || '#'}
                            onClick={handleLinkClick}
                            className="px-6 py-2 text-sm hover:bg-accent transition-colors"
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
