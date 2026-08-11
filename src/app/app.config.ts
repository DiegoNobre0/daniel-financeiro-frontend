import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {
  LucideAngularModule,
  LayoutDashboard, ShoppingCart, Trello, Package, ChevronDown, ChevronRight,
  Users, MessageSquare, Menu, Search, Bell, ShoppingBag, AlertTriangle, RefreshCw,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  MoreVertical,
  FileText,
  Download,
  Plus,
  PackagePlus,
  Pencil,
  Eye,
  Trash2,
  EyeOff,
  X,
  ImagePlus,
  Save,
  ChevronUp,
  Tag,
  Gift,
  MessageCircle,
  User,
  Bot,
  Hand,
  Paperclip,
  Mic,
  Send,
  Truck,
  UserPlus,
  CheckCircle,
  LogOut,
  HelpCircle,
  Check,
  Inbox,
  ArrowRight,
  Car,
  Loader2,
  CalendarCheck,
  ArrowLeft,
  Phone,
  Info,
  Edit2,
  Layers,
  CalendarDays,
  ChevronLeft,
  CalendarPlus,
  Ban,
  Wallet,
  Lock,
  Unlock,
  CheckSquare,
  Receipt,
  ArrowLeftRight,
  Wrench,
  Percent,
  Smartphone,
  ExternalLink,
  Instagram,
  MapPin,
  Copy,
  CalendarClock,
  XCircle,
  BarChart2,
  Filter,
  PlusCircle,
  LogIn,
  ClipboardList,
  ArrowDownCircle,
  ArrowUpCircle,
  PackageOpen,
  ArrowRightLeft,
  BellRing,
  UserMinus,
  TrendingDown,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ListChecks,
  Circle,
  ArrowDownRight,
  Minus,
  BarChart3,
  Scale,
  CheckCircle2,
  Edit
} from 'lucide-angular';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

// 1. Criamos a função que "Trava" o Angular até o login silencioso terminar
export function initializeApp(authService: AuthService) {
  return () => {
    // firstValueFrom transforma o Observable em uma Promise (Faz o Angular esperar acabar)
    return firstValueFrom(authService.autoLogin());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),
    provideEnvironmentNgxMask(),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),    
    {
      provide: MAT_DATE_LOCALE, 
      useValue: 'pt-BR' 
    },


    // 2. Registramos a trava de inicialização aqui!
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    },

    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard, ShoppingCart, Trello, Package, ChevronDown, ChevronRight,
        Users, MessageSquare, Menu, Search, Bell, ShoppingBag, AlertTriangle, RefreshCw,
        Settings, TrendingUp, Clock, DollarSign, Calendar, MoreVertical, FileText, Download,
        Plus, PackagePlus, Pencil, Eye, Trash2, EyeOff, X, ImagePlus, Save, ChevronUp, Tag,
        Gift, MessageCircle, User, Bot, Hand, Paperclip, Mic, Send, Truck, UserPlus, CheckCircle ,LogOut,
        HelpCircle, Check, Inbox, ArrowRight , Car, Loader2, CalendarCheck, ArrowLeft , Phone, Info, Edit2 , Layers,
        CalendarDays, ChevronLeft ,CalendarPlus, Ban, Wallet, Lock , Unlock, CheckSquare , Receipt , ArrowLeftRight , Wrench, Percent,
        Smartphone, ExternalLink, Instagram, MapPin, Copy, CalendarClock, XCircle, BarChart2, Filter, PlusCircle, LogIn, ArrowRightLeft,
        ClipboardList, ArrowDownCircle, ArrowUpCircle, PackageOpen ,BellRing, UserMinus, TrendingDown, AlertCircle , ArrowDownLeft, ArrowUpRight,Circle,
        ListChecks, ArrowDownRight, Minus, BarChart3, Scale , CheckCircle2, Edit
      })
    )
  ]
};
