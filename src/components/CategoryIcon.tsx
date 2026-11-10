import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Gift,
  Briefcase,
  Store,
  Laptop,
  TrendingUp,
  Award,
  PlusCircle,
  HelpCircle,
  Coffee,
  Fuel,
  Home,
  Smartphone,
  CreditCard,
  Tag,
  DollarSign,
  Landmark,
  Wallet,
  HeartHandshake,
  Banknote,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  ShoppingBag,
  Car,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Gift,
  Briefcase,
  Store,
  Laptop,
  TrendingUp,
  Award,
  PlusCircle,
  HelpCircle,
  Coffee,
  Fuel,
  Home,
  Smartphone,
  CreditCard,
  Tag,
  DollarSign,
  Landmark,
  Wallet,
  HeartHandshake,
  Banknote,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent className={className} size={size} />;
};
