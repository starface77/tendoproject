/**
 * 🛠️ CHEXOL.UZ ADMIN PANEL FRONTEND
 * Клиентская часть админской панели
 */

class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.user = null;
        this.init();
    }

    async init() {
        // Показать загрузку
        this.showLoading();
        
        // Проверить авторизацию
        if (this.token) {
            const isValid = await this.verifyToken();
            if (isValid) {
                await this.showAdmin();
            } else {
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
        
        // Скрыть загрузку
        this.hideLoading();
        
        // Инициализация событий
        this.initEvents();
        
        // Обновление времени
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    showLoading() {
        document.getElementById('loadingScreen').classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 500);
    }

    showLogin() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('adminApp').classList.add('hidden');
    }

    async showAdmin() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('adminApp').classList.remove('hidden');
        
        // Загрузить данные дашборда
        await this.loadDashboard();
        
        // Загрузить уведомления
        await this.loadNotifications();
    }

    async verifyToken() {
        try {
            const response = await this.apiCall('/api/auth/verify', 'GET');
            if (response.success) {
                this.user = response.user;
                this.updateUserInfo();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('adminToken', this.token);
                await this.showAdmin();
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('adminToken');
        this.showLogin();
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(endpoint, options);
            const result = await response.json();
            
            if (response.status === 401) {
                this.logout();
                throw new Error('Необходима повторная авторизация');
            }
            
            return result;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    async loadDashboard() {
        try {
            const response = await this.apiCall('/api/dashboard/stats');
            if (response.success) {
                this.updateDashboardStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    updateDashboardStats(data) {
        // Обновляем статистику
        document.getElementById('totalOrders').textContent = data.overview.totalOrders.toLocaleString();
        document.getElementById('totalRevenue').textContent = `${(data.overview.totalRevenue / 1000).toFixed(1)}K`;
        document.getElementById('totalUsers').textContent = data.overview.totalUsers.toLocaleString();
        document.getElementById('totalProducts').textContent = data.overview.totalProducts.toLocaleString();

        // Обновляем последние заказы
        this.updateRecentOrders(data.recentOrders);
        
        // Обновляем топ товары
        this.updateTopProducts(data.topProducts);
    }

    updateRecentOrders(orders) {
        const container = document.getElementById('recentOrders');
        
        if (!orders || orders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Нет заказов</p>';
            return;
        }

        const html = orders.map(order => `
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                    <p class="font-medium text-sm">#${order.orderNumber}</p>
                    <p class="text-xs text-gray-500">${order.customer.firstName} ${order.customer.lastName}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-sm">${order.pricing.total.toLocaleString()} сум</p>
                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(order.status)}">
                        ${this.getStatusText(order.status)}
                    </span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateTopProducts(products) {
        const container = document.getElementById('topProducts');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Нет данных</p>';
            return;
        }

        const html = products.map(product => `
            <div class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                    <i class="fas fa-box text-gray-500"></i>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-sm">${product.name.ru}</p>
                    <p class="text-xs text-gray-500">${product.purchases} продаж</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-sm">${product.price.toLocaleString()} сум</p>
                    <div class="flex items-center text-xs text-gray-500">
                        <i class="fas fa-star text-yellow-500 mr-1"></i>
                        ${product.rating.average.toFixed(1)}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    async loadNotifications() {
        try {
            const response = await this.apiCall('/api/dashboard/notifications');
            if (response.success) {
                this.updateNotifications(response.data);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    updateNotifications(notifications) {
        const notificationsList = document.getElementById('notificationsList');
        const notificationDot = document.getElementById('notificationDot');
        const pendingOrdersCount = document.getElementById('pendingOrdersCount');
        const pendingReviewsCount = document.getElementById('pendingReviewsCount');

        // Показать точку уведомлений
        if (notifications.length > 0) {
            notificationDot.classList.remove('hidden');
        } else {
            notificationDot.classList.add('hidden');
        }

        // Обновить счетчики в боковой панели
        notifications.forEach(notification => {
            if (notification.title === 'Новые заказы' && notification.count > 0) {
                pendingOrdersCount.textContent = notification.count;
                pendingOrdersCount.classList.remove('hidden');
            }
            
            if (notification.title === 'Модерация отзывов' && notification.count > 0) {
                pendingReviewsCount.textContent = notification.count;
                pendingReviewsCount.classList.remove('hidden');
            }
        });

        // Обновить список уведомлений
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<div class="p-4 text-center text-gray-500">Нет уведомлений</div>';
        } else {
            const html = notifications.map(notification => `
                <div class="p-4 border-b hover:bg-gray-50 cursor-pointer" onclick="window.location.href='${notification.link}'">
                    <div class="flex items-center">
                        <div class="w-2 h-2 rounded-full mr-3 ${notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}"></div>
                        <div class="flex-1">
                            <p class="font-medium text-sm">${notification.title}</p>
                            <p class="text-xs text-gray-500">${notification.message}</p>
                        </div>
                        ${notification.count ? `<span class="text-xs bg-gray-200 px-2 py-1 rounded-full">${notification.count}</span>` : ''}
                    </div>
                </div>
            `).join('');
            
            notificationsList.innerHTML = html;
        }
    }

    updateUserInfo() {
        if (this.user) {
            const initials = `${this.user.firstName[0]}${this.user.lastName[0]}`;
            document.getElementById('userInitials').textContent = initials;
            document.getElementById('userName').textContent = `${this.user.firstName} ${this.user.lastName}`;
            document.getElementById('userRole').textContent = this.user.role;
        }
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        document.getElementById('currentTime').textContent = timeString;
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'processing': 'bg-orange-100 text-orange-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'pending': 'Ожидает',
            'confirmed': 'Подтвержден',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        return texts[status] || status;
    }

    initEvents() {
        // Форма входа
        document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loginError = document.getElementById('loginError');
            
            loginBtn.innerHTML = '<div class="loading"></div> Вход...';
            loginBtn.disabled = true;
            loginError.classList.add('hidden');
            
            const result = await this.login(email, password);
            
            if (!result.success) {
                loginError.textContent = result.error;
                loginError.classList.remove('hidden');
                loginBtn.innerHTML = 'Войти';
                loginBtn.disabled = false;
            }
        });

        // Выход
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                this.logout();
            }
        });

        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Убрать активный класс у всех
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                
                // Добавить активный класс текущему
                item.classList.add('active');
                
                // Обновить заголовок
                const href = item.getAttribute('href').substring(1);
                this.showSection(href);
            });
        });

        // Уведомления
        document.getElementById('notificationsBtn').addEventListener('click', () => {
            const panel = document.getElementById('notificationsPanel');
            panel.classList.toggle('hidden');
        });

        // Закрытие панели уведомлений при клике вне её
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationsPanel');
            const btn = document.getElementById('notificationsBtn');
            
            if (!panel.contains(e.target) && !btn.contains(e.target)) {
                panel.classList.add('hidden');
            }
        });
    }

    showSection(section) {
        const titles = {
            'dashboard': 'Дашборд',
            'orders': 'Заказы',
            'products': 'Товары',
            'categories': 'Категории',
            'users': 'Пользователи',
            'reviews': 'Отзывы',
            'analytics': 'Аналитика',
            'settings': 'Настройки'
        };

        document.getElementById('pageTitle').textContent = titles[section] || 'Админ панель';

        if (section === 'dashboard') {
            document.getElementById('dashboardContent').classList.remove('hidden');
            document.getElementById('otherContent').classList.add('hidden');
        } else {
            document.getElementById('dashboardContent').classList.add('hidden');
            document.getElementById('otherContent').classList.remove('hidden');
        }
    }
}

// Инициализация админ панели
const admin = new AdminPanel();
