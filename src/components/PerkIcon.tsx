import React from 'react';
import {
  Snowflake,
  Star,
  Zap,
  Flame,
  Target,
  Handshake,
  Briefcase,
  Building,
  DollarSign,
  TrendingUp,
  Heart,
  Users,
  Mic,
  ShieldCheck,
  Sparkles,
  Activity,
  Award,
  Brain,
  Globe,
  Crown,
  Scale,
  ShieldAlert,
  Shield,
  Coins,
  LucideProps,
} from 'lucide-react';
import { OutsideFootBallIcon } from './OutsideFootBallIcon';

interface PerkIconProps extends LucideProps {
  iconName: string;
}

export const PerkIcon: React.FC<PerkIconProps> = ({ iconName, className = 'w-5 h-5', ...props }) => {
  switch (iconName) {
    case 'OutsideFoot':
    case 'outside_foot':
    case 'Trivela':
    case 'trivela':
      return <OutsideFootBallIcon className={className} {...props} />;
    case 'Snowflake':
      return <Snowflake className={className} {...props} />;
    case 'Star':
      return <Star className={className} {...props} />;
    case 'Zap':
      return <Zap className={className} {...props} />;
    case 'Flame':
      return <Flame className={className} {...props} />;
    case 'Target':
      return <Target className={className} {...props} />;
    case 'Handshake':
      return <Handshake className={className} {...props} />;
    case 'Briefcase':
      return <Briefcase className={className} {...props} />;
    case 'Building':
      return <Building className={className} {...props} />;
    case 'DollarSign':
      return <DollarSign className={className} {...props} />;
    case 'TrendingUp':
      return <TrendingUp className={className} {...props} />;
    case 'Heart':
      return <Heart className={className} {...props} />;
    case 'Users':
      return <Users className={className} {...props} />;
    case 'Mic':
      return <Mic className={className} {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} {...props} />;
    case 'Sparkles':
      return <Sparkles className={className} {...props} />;
    case 'Activity':
      return <Activity className={className} {...props} />;
    case 'Award':
      return <Award className={className} {...props} />;
    case 'Brain':
      return <Brain className={className} {...props} />;
    case 'Globe':
      return <Globe className={className} {...props} />;
    case 'Crown':
      return <Crown className={className} {...props} />;
    case 'Scale':
      return <Scale className={className} {...props} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} {...props} />;
    case 'Shield':
      return <Shield className={className} {...props} />;
    case 'Coins':
      return <Coins className={className} {...props} />;
    default:
      return <Sparkles className={className} {...props} />;
  }
};
