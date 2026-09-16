import React from 'react';
import {
  Wrench,
  Zap,
  ShieldCheck,
  Layout,
  Search,
  Code2,
  Database,
  Activity,
  LifeBuoy,
  Clock,
  FileCheck,
  Users,
  Target,
  PieChart,
  Gauge,
  SearchCode,
  FileText,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Package,
  Smartphone,
  UploadCloud,
  Cpu,
  HelpCircle
} from 'lucide-react';

const ICON_MAP = {
  Wrench,
  Zap,
  ShieldCheck,
  Layout,
  Search,
  Code2,
  Database,
  Activity,
  LifeBuoy,
  Clock,
  FileCheck,
  Users,
  Target,
  PieChart,
  Gauge,
  SearchCode,
  FileText,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Package,
  Smartphone,
  UploadCloud,
  Cpu
};

export const DynamicIcon = ({ name, size = 16, className = '' }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
};
