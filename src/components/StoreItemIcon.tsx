import React from 'react';
import { StoreUpgradeItem } from '../types';
import {
  Dna,
  FlaskConical,
  Car,
  Bandage,
  Pill,
  Zap,
  Coffee,
  Activity,
  Brain,
  Flame,
  Dumbbell,
  Home,
  Utensils,
  Building2,
  Award,
  Heart,
  Sparkles,
  Scissors,
  Shield,
  Footprints,
  Hand,
  ShieldCheck,
  ShoppingBag,
  CircleDot,
  Crown,
  Package,
} from 'lucide-react';

interface StoreItemIconProps {
  item: StoreUpgradeItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StoreItemIcon: React.FC<StoreItemIconProps> = ({
  item,
  className = '',
  size = 'md',
}) => {
  const getIcon = () => {
    const key = (item.iconKey || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    const name = (item.name || '').toLowerCase();

    // 1. Specific Keys
    if (key === 'dna' || id.includes('genetic')) return <Dna className="w-full h-full" />;
    if (key === 'flask' || id.includes('chemical') || id.includes('supplement')) return <FlaskConical className="w-full h-full" />;
    if (key === 'car' || id.includes('luxury_car')) return <Car className="w-full h-full" />;
    if (key === 'bandage' || id.includes('taping') || id.includes('socks')) return <Bandage className="w-full h-full" />;
    if (key === 'pill' || id.includes('recovery_supplement')) return <Pill className="w-full h-full" />;
    if (key === 'zap' || id.includes('electrolyte') || id.includes('energy')) return <Zap className="w-full h-full" />;
    if (key === 'cup' || key === 'drink' || id.includes('hydrat')) return <Coffee className="w-full h-full" />;
    if (key === 'brain' || id.includes('cognitive') || id.includes('nootropic')) return <Brain className="w-full h-full" />;
    if (key === 'flame' || id.includes('goggins')) return <Flame className="w-full h-full" />;
    if (key === 'dumbbell' || id.includes('recovery_equip')) return <Dumbbell className="w-full h-full" />;
    if (key === 'home' || id.includes('home_gym')) return <Home className="w-full h-full" />;
    if (key === 'utensils' || id.includes('kitchen') || id.includes('nutrition')) return <Utensils className="w-full h-full" />;
    if (key === 'building' || id.includes('complex')) return <Building2 className="w-full h-full" />;
    if (key === 'award' || id.includes('center')) return <Award className="w-full h-full" />;
    if (key === 'heart' || id.includes('kinesio')) return <Heart className="w-full h-full" />;
    if (key === 'scissors' || id.includes('hair') || item.category === 'special_hair') return <Scissors className="w-full h-full" />;
    if (key === 'shinguards' || id.includes('shinguards') || id.includes('shin')) return <ShieldCheck className="w-full h-full" />;
    if (key === 'gloves' || id.includes('glove')) return <Hand className="w-full h-full" />;
    if (key === 'boots' || key === 'cleats' || id.includes('boot') || id.includes('footwear')) return <Footprints className="w-full h-full" />;

    // 2. Category Fallbacks
    const category = item.category as string;
    if (category === 'consumables' || category === 'consumable') return <Pill className="w-full h-full" />;
    if (category === 'upgrade') return <Building2 className="w-full h-full" />;
    if (category === 'season_boost') return <Sparkles className="w-full h-full" />;
    if (category === 'pro_equipment' || category === 'equipment') return <ShoppingBag className="w-full h-full" />;
    if (category === 'special_hair' || category === 'cosmetics') return <Scissors className="w-full h-full" />;

    return <Package className="w-full h-full" />;
  };

  // Unique category styling for the icon container
  const getCategoryStyles = () => {
    switch (item.category as string) {
      case 'consumables':
      case 'consumable':
        return {
          bg: 'bg-gradient-to-br from-emerald-950/80 to-teal-900/60',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          glow: 'shadow-emerald-950/40',
        };
      case 'upgrade':
        return {
          bg: 'bg-gradient-to-br from-amber-950/80 to-orange-900/60',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          glow: 'shadow-amber-950/40',
        };
      case 'season_boost':
        return {
          bg: 'bg-gradient-to-br from-purple-950/80 to-indigo-900/60',
          border: 'border-purple-500/40',
          text: 'text-purple-300',
          glow: 'shadow-purple-950/40',
        };
      case 'pro_equipment':
      case 'equipment':
        return {
          bg: 'bg-gradient-to-br from-cyan-950/80 to-sky-900/60',
          border: 'border-cyan-500/40',
          text: 'text-cyan-400',
          glow: 'shadow-cyan-950/40',
        };
      case 'special_hair':
      case 'cosmetics':
        return {
          bg: 'bg-gradient-to-br from-pink-950/80 to-rose-900/60',
          border: 'border-pink-500/40',
          text: 'text-pink-400',
          glow: 'shadow-pink-950/40',
        };
      default:
        return {
          bg: 'bg-slate-800/80',
          border: 'border-slate-700',
          text: 'text-slate-300',
          glow: 'shadow-slate-900/40',
        };
    }
  };

  const style = getCategoryStyles();
  const dimension = size === 'sm' ? 'w-7 h-7 p-1.5' : size === 'lg' ? 'w-12 h-12 p-2.5' : 'w-9 h-9 p-2';

  return (
    <div
      className={`rounded-xl border shrink-0 flex items-center justify-center shadow-md transition-transform hover:scale-105 ${dimension} ${style.bg} ${style.border} ${style.text} ${style.glow} ${className}`}
    >
      {getIcon()}
    </div>
  );
};
