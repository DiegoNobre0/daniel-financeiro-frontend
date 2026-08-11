import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ----------------------------------------------------
  // ROTAS PÚBLICAS (Sem Layout)
  // ----------------------------------------------------
  {
    path: 'login',
    title: 'Login',
    // Dica: verifique se o arquivo chama apenas 'login' ou 'login.component'
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) 
  },

  // ----------------------------------------------------
  // ROTAS PRIVADAS (Com Layout - Sidebar e Header)
  // ----------------------------------------------------
  {
    path: '',
    canActivate: [authGuard], // O Guardião fica na porta principal e protege tudo lá dentro!
    loadComponent: () => import('./components/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      // Se acessar apenas a raiz ('/'), joga direto pro dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // 👇 ROTA DO DASHBOARD QUE ESTAVA FALTANDO 👇
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        title: 'Clientes',
        loadComponent: () => import('./pages/clientes-list/clientes-list').then(m => m.ClientsListComponent)
      },
      {
        path: 'produtos/servicos',
        title: 'Produtos e Serviços',
        loadComponent: () => import('./pages/products-services/products-services').then(m => m.ProductsServicesListComponent)
      },
      {
        path: 'vendas',
        title: 'Vendas',
        loadComponent: () => import('./pages/contracts/contracts').then(m => m.ContractsListComponent)
      },
      {
        path: 'relatorios',
        title: 'Relatórios',
        loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent)
      },
      {
        path: 'agenda',
        title: 'Agenda',
        loadComponent: () => import('./pages/tasks/tasks').then(m => m.TasksListComponent)
      },
      {
        path: 'financeiro',
        title: 'Financeiro',
        loadComponent: () => import('./pages/transactions/transactions').then(m => m.TransactionsListComponent)
      }
    ]
  },

  // ----------------------------------------------------
  // ROTA DE FALLBACK (Erro 404)
  // ----------------------------------------------------
  {
    path: '**',
    redirectTo: 'dashboard' // Manda pro dashboard (Se não estiver logado, o authGuard chuta pro login)
  }
];