import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Lazy loading for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const PaymentStatusPage = lazy(() => import('./pages/PaymentStatusPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const BecomeSellerPage = lazy(() => import('./pages/BecomeSellerPage'))

// Seller Dashboard
const SellerLayout = lazy(() => import('./pages/seller/SellerLayout'))
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'))
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'))
const SellerFinance = lazy(() => import('./pages/seller/SellerFinance'))
const SellerSettings = lazy(() => import('./pages/seller/SellerSettings'))
const AddProductForm = lazy(() => import('./pages/seller/AddProductForm'))
const EditProductForm = lazy(() => import('./pages/seller/EditProductForm'))

// Профиль продавца  
const SellerProfilePage = lazy(() => import('./pages/SellerProfilePage'))

// Информационные страницы
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))

// Удаляем тестовые/демо страницы из прод-маршрутов

// LaunchGuard компонент
// import LaunchGuard from './components/LaunchGuard'

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <ErrorBoundary>
                <Navbar />
              </ErrorBoundary>

              <main className="flex-1">
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                    {/* Главная страница с проверкой статуса запуска */}
                    <Route path="/" element={
                        <HomePage />
                    } />

                    {/* Pre-launch отключено */}

                    {/* Все остальные страницы защищены LaunchGuard */}
                    <Route path="/*" element={
                        <Routes>
                          <Route path="/catalog" element={<CatalogPage />} />
                          <Route path="/category/:categoryId" element={<CategoryPage />} />
                          <Route path="/product/:id" element={<ProductPage />} />
                          <Route path="/search" element={<SearchPage />} />

                          {/* Корзина и заказы */}
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/order-success" element={<OrderSuccessPage />} />
                          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                          <Route path="/payment-status/:paymentId" element={<PaymentStatusPage />} />

                          {/* Личный кабинет */}
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/orders" element={<OrdersPage />} />
                          <Route path="/order/:orderId" element={<OrderTrackingPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/messages" element={<MessagesPage />} />
                          <Route path="/settings" element={<SettingsPage />} />

                          {/* Авторизация */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />

                          {/* Продавцы */}
                          <Route path="/become-seller" element={<BecomeSellerPage />} />
                          <Route path="/seller/:sellerId" element={<SellerProfilePage />} />
                          <Route path="/seller" element={<SellerLayout />}>
                            <Route index element={<SellerDashboard />} />
                            <Route path="products" element={<SellerProducts />} />
                            <Route path="products/add" element={<AddProductForm />} />
                            <Route path="products/edit/:id" element={<EditProductForm />} />
                            <Route path="orders" element={<SellerOrders />} />
                            <Route path="finance" element={<SellerFinance />} />
                            <Route path="settings" element={<SellerSettings />} />
                          </Route>

                          {/* Информационные страницы */}
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/contacts" element={<ContactsPage />} />
                          <Route path="/faq" element={<FAQPage />} />

                          {/* Специальные разделы из сайдбара */}
                          <Route path="/brands" element={<Navigate to="/catalog?filter=brands" replace />} />
                          <Route path="/sales" element={<Navigate to="/catalog?filter=sales" replace />} />
                          <Route path="/new" element={<Navigate to="/catalog?filter=new" replace />} />

                          {/* Убраны demo/dev разделы */}

                          {/* 404 */}
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    } />
                  </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>

              <ErrorBoundary>
                <Footer />
              </ErrorBoundary>
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
