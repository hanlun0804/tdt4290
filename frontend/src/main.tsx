import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import CreateDataPage from './pages/userland/CreateDataPage.tsx'
import AccountTransactionsPage from './pages/cheque-client/AccountTransactionPage.tsx'
import CustomerQueryPage from './pages/cheque-client/CustomerQueryPage.tsx'
import CustomerAccountsPage from './pages/cheque-client/CustomerAccountsPage.tsx'
import PhonePage from './pages/cheque-client/PhonePage.tsx'
import BaffelPage from './pages/baffel/BaffelPage.tsx'
import TransactionBySocialSecurity from './pages/cheque-client/TransactionBySocialSecurity.tsx'
import BaffelSummaryPage from './pages/baffel/BaffelSummaryPage.tsx'
import BaffelTextModePage from './pages/baffel/BaffelTextMode.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/baffel',
    element: <BaffelPage />,
  },
  {
    path: '/baffel/text-mode',
    element: <BaffelTextModePage />,
  },
  {
    path: '/baffel/summary',
    element: <BaffelSummaryPage />,
  },
  {
    path: '/userland',
    element: <CreateDataPage />,
  },
  {
    path: '/cheque-client',
    element: <App />,
    children: [
      {
        path: '/cheque-client',
        element: <CustomerQueryPage />,
      },
      {
        path: '/cheque-client/transactions/customer',
        element: <TransactionBySocialSecurity />,
      },
      {
        path: '/cheque-client/customers/:customerId',
        element: <CustomerAccountsPage />,
      },
      {
        path: '/cheque-client/accounts/:accountId',
        element: <AccountTransactionsPage />,
      },
      {
        path: '/cheque-client/phone',
        element: <PhonePage />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
