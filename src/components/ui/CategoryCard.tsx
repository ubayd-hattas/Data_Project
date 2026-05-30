import Link from 'next/link'
import {
  Briefcase, TrendingUp, ShoppingCart, Shield,
  GraduationCap, Users, Home, BarChart3, LucideIcon,
} from 'lucide-react'
import { Category } from '@/types'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  Briefcase, TrendingUp, ShoppingCart, Shield,
  GraduationCap, Users, Home, BarChart3,
}

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] ?? BarChart3
  return (
    <Link
      href={`/category/${category.id}`}
      className="card group flex flex-col gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', category.bgColor)}>
        <Icon size={20} className={category.color} />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition-colors">
          {category.label}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
          {category.description}
        </p>
      </div>
      <p className="text-xs font-medium text-slate-400">
        {category.stats} dataset{category.stats !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}
