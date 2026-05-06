import {
  UtensilsCrossed, Car, Home, Clapperboard, HeartPulse,
  ShoppingBag, Zap, Briefcase, Laptop, Coins,
  LayoutDashboard, ArrowLeftRight, PieChart, Target, Sparkles,
  Plus, X, Search, RefreshCw, Trash2, ChevronRight,
  TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown,
  Check, Pencil, BarChart2, Activity, Clock, AlertCircle,
  ChevronDown, ChevronUp, Edit2, Save, Bitcoin, Globe,
  DollarSign, Landmark, LineChart, SlidersHorizontal,
  RotateCcw, CheckCircle2, Package, Cpu, Star,
} from 'lucide-react';

const REGISTRY = {
  UtensilsCrossed, Car, Home, Clapperboard, HeartPulse,
  ShoppingBag, Zap, Briefcase, Laptop, Coins,
  LayoutDashboard, ArrowLeftRight, PieChart, Target, Sparkles,
  Plus, X, Search, RefreshCw, Trash2, ChevronRight,
  TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown,
  Check, Pencil, BarChart2, Activity, Clock, AlertCircle,
  ChevronDown, ChevronUp, Edit2, Save, Bitcoin, Globe,
  DollarSign, Landmark, LineChart, SlidersHorizontal,
  RotateCcw, CheckCircle2, Package, Cpu, Star,
};

export default function Icon({ name, size = 16, className = '', strokeWidth = 1.75, style, ...props }) {
  const Comp = REGISTRY[name];
  if (!Comp) return null;
  return <Comp size={size} strokeWidth={strokeWidth} className={className} style={style} {...props} />;
}
