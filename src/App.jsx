import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login/Login'
import { Home } from './pages/Home/Home'
import CreateAccount from './pages/CreateAccount/CreateAccount'
import ProductByCategory from './pages/ProductByCategory/ProductByCategory'
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Order from './pages/Order/Order'
import Payment from './pages/Payment/Payment'
import Cart from './pages/Cart/Cart'
import Support from './pages/Support/Support'
import Search from './pages/Search/Search'
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess'
import EditUser from './pages/EditUser/EditUser';
import StatusOrder from './pages/StatusOrder/StatusOrder';
import PrivateRoute from './routes/PrivateRoute';

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function App() {

  return (

    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
          },
        }}
      />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/category/:categoryId" element={<ProductByCategory />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/order/:productId" element={<Order />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/edit-user" element={<EditUser />} />
          <Route path="/status-order" element={<StatusOrder />} />
        </Route>
        <Route path="/support" element={<Support />} />
        <Route path="/search" element={<Search />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
