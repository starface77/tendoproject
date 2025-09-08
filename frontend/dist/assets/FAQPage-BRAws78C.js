import{b as j,u as N,r as d,am as m,f as w,l as v,D as q,ai as C,j as e,e as S,ab as k,an as F,v as _}from"./index-U3rPQCjX.js";const A=()=>{const b=j(),{t:a}=N(),[n,x]=d.useState(""),[c,h]=d.useState("all"),[g,p]=d.useState(new Set),f=[{id:"all",name:a("faq.all_questions","Все вопросы"),icon:m},{id:"orders",name:a("faq.orders","Заказы"),icon:w},{id:"delivery",name:a("faq.delivery","Доставка"),icon:v},{id:"payment",name:a("faq.payment","Оплата"),icon:q},{id:"account",name:a("faq.account","Аккаунт"),icon:C}],o=[{category:"orders",question:"Как оформить заказ?",answer:`Оформить заказ очень просто:

**Шаг 1:** Выберите товар и добавьте его в корзину
**Шаг 2:** Перейдите в корзину и проверьте свой заказ
**Шаг 3:** Заполните адрес доставки и контактные данные
**Шаг 4:** Выберите способ оплаты и подтвердите заказ

После оформления заказа вы получите подтверждение по email и SMS.`},{category:"orders",question:"Как отменить заказ?",answer:`Заказ можно отменить в следующих случаях:

- До подтверждения заказа продавцом (обычно в течение 1-2 часов)
- В течение 24 часов после оформления (если товар еще не передан в доставку)

Для отмены заказа:
1. Перейдите в раздел "Мои заказы"
2. Найдите нужный заказ
3. Нажмите "Отменить заказ"

При отмене заказа денежные средства будут возвращены на ваш счет.`},{category:"delivery",question:"Какие способы доставки доступны?",answer:`Мы предлагаем несколько вариантов доставки:

**Курьерская доставка:**
- Доставка по Ташкенту: от 10,000 сум
- Доставка по регионам: от 25,000 сум
- Срок: 1-3 дня

**Самовывоз:**
- Из пунктов выдачи: бесплатно
- Из магазинов партнеров: бесплатно

**Экспресс-доставка:**
- Доставка в день заказа: от 50,000 сум
- Доступно с 9:00 до 21:00`},{category:"delivery",question:"Как отслеживать статус доставки?",answer:`Отслеживать статус доставки можно несколькими способами:

**Через личный кабинет:**
1. Перейдите в раздел "Мои заказы"
2. Выберите нужный заказ
3. Посмотрите статус доставки

**По номеру заказа:**
- Позвоните в службу поддержки: +998 78 150 15 15
- Напишите в чат поддержки

**Статусы доставки:**
- Готовится к отправке
- Передан в доставку
- В пути
- Доставлен`},{category:"payment",question:"Какие способы оплаты доступны?",answer:`Мы принимаем следующие способы оплаты:

**Банковские карты:**
- Visa, MasterCard, UzCard, Humo
- Оплата онлайн без комиссии

**Наличными:**
- При получении заказа
- Через терминалы оплаты

**Электронные кошельки:**
- PayMe, Click, Apelsin
- Быстрая оплата без комиссии

Все платежи защищены и соответствуют стандартам безопасности PCI DSS.`},{category:"payment",question:"Как вернуть деньги за заказ?",answer:`Возврат денежных средств осуществляется:

**При отмене заказа:**
- Автоматический возврат на карту/кошелек
- Срок: 3-7 рабочих дней

**При возврате товара:**
- Возврат после проверки товара
- Срок рассмотрения: до 3 дней
- Возврат денег: 3-7 рабочих дней

**Причины возврата:**
- Товар не соответствует описанию
- Товар с дефектом
- Неправильный размер/цвет`},{category:"account",question:"Как зарегистрироваться на сайте?",answer:`Регистрация занимает всего пару минут:

**Через email:**
1. Нажмите "Регистрация"
2. Введите email и пароль
3. Подтвердите email по ссылке

**Через социальные сети:**
1. Нажмите "Войти через Google/Facebook"
2. Разрешите доступ к данным
3. Профиль создан автоматически

После регистрации вы получите доступ к личному кабинету, истории заказов и персональным скидкам.`},{category:"account",question:"Как восстановить пароль?",answer:`Восстановить пароль очень просто:

**Способ 1: Через email**
1. Нажмите "Забыли пароль?"
2. Введите email от аккаунта
3. Получите письмо с инструкциями
4. Перейдите по ссылке и установите новый пароль

**Способ 2: Через поддержку**
- Позвоните: +998 78 150 15 15
- Укажите email и последние цифры телефона

Пароль должен содержать минимум 8 символов и включать буквы и цифры.`}],u=o.filter(s=>{const t=c==="all"||s.category===c,l=n===""||s.question.toLowerCase().includes(n.toLowerCase())||s.answer.toLowerCase().includes(n.toLowerCase());return t&&l}),y=s=>{const t=new Set(g);t.has(s)?t.delete(s):t.add(s),p(t)};return e.jsx("div",{className:"min-h-screen bg-gray-50",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs("button",{onClick:()=>b(-1),className:"flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6",children:[e.jsx(S,{className:"mr-2"}),a("faq.back","Назад")]}),e.jsxs("div",{className:"flex items-start space-x-4 mb-6",children:[e.jsx("div",{className:"w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center",children:e.jsx(m,{className:"w-8 h-8 text-blue-600"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900 mb-2",children:a("faq.title","Часто задаваемые вопросы")}),e.jsx("p",{className:"text-xl text-gray-600",children:a("faq.subtitle","Найдите ответы на популярные вопросы или свяжитесь с нашей поддержкой")})]})]})]}),e.jsxs("div",{className:"bg-white rounded-lg shadow-sm border p-6 md:p-8",children:[e.jsxs("div",{className:"mb-12",children:[e.jsx("h2",{className:"text-3xl font-bold text-gray-900 mb-4",children:a("faq.categories","Категории")}),e.jsx("p",{className:"text-lg text-gray-600 mb-8 leading-relaxed",children:a("faq.more_than_1000","Более 1000 вопросов и ответов")}),e.jsxs("div",{className:"relative max-w-xl",children:[e.jsx(k,{className:"absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"}),e.jsx("input",{type:"text",value:n,onChange:s=>x(s.target.value),placeholder:a("faq.search_placeholder","Поиск по вопросам..."),className:"w-full pl-12 pr-4 py-4 bg-white text-gray-900 placeholder-gray-500 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors text-lg"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-4 gap-8",children:[e.jsxs("div",{className:"lg:col-span-1",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:a("faq.categories","Категории")}),e.jsx("div",{className:"space-y-2",children:f.map(s=>{const t=s.icon,l=c===s.id,r=s.id==="all"?o.length:o.filter(i=>i.category===s.id).length;return e.jsxs("button",{onClick:()=>h(s.id),className:`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${l?"bg-blue-50 text-blue-600 border border-blue-200":"hover:bg-gray-50 text-gray-700"}`,children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx(t,{className:"h-5 w-5 mr-3"}),e.jsx("span",{className:"font-medium",children:s.name})]}),e.jsx("span",{className:`text-sm ${l?"text-blue-500":"text-gray-500"}`,children:r})]},s.id)})})]}),e.jsx("div",{className:"lg:col-span-3",children:u.length===0?e.jsxs("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center",children:[e.jsx(m,{className:"h-12 w-12 text-gray-300 mx-auto mb-4"}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"Вопросы не найдены"}),e.jsx("p",{className:"text-gray-600 mb-6",children:"Попробуйте изменить поисковый запрос или выбрать другую категорию"}),e.jsx("button",{onClick:()=>{x(""),h("all")},className:"text-blue-600 hover:text-blue-700 font-medium",children:"Сбросить фильтры"})]}):e.jsx("div",{className:"space-y-4",children:u.map((s,t)=>{const l=g.has(t);return e.jsxs("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200",children:[e.jsxs("button",{onClick:()=>y(t),className:"w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors",children:[e.jsx("h3",{className:"font-medium text-gray-900 pr-4 text-lg",children:s.question}),l?e.jsx(F,{className:"h-5 w-5 text-gray-500 flex-shrink-0"}):e.jsx(_,{className:"h-5 w-5 text-gray-500 flex-shrink-0"})]}),l&&e.jsx("div",{className:"px-8 pb-8",children:e.jsx("div",{className:"border-t border-gray-200 pt-6",children:e.jsx("div",{className:"prose prose-base max-w-none text-gray-600 leading-relaxed",children:s.answer.split(`
`).map((r,i)=>e.jsx("p",{className:"mb-2 last:mb-0",children:r.startsWith("**")&&r.endsWith("**")?e.jsx("strong",{className:"text-gray-900",children:r.slice(2,-2)}):r.startsWith("- ")?e.jsxs("span",{className:"block ml-4",children:["• ",r.slice(2)]}):r.match(/^\d+\./)?e.jsx("span",{className:"block ml-4",children:r}):r},i))})})})]},t)})})})]}),e.jsxs("div",{className:"mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center",children:[e.jsx("h3",{className:"text-xl font-bold mb-4",children:a("faq.no_answer_title","Не нашли ответ на свой вопрос?")}),e.jsx("p",{className:"mb-6 text-blue-100",children:a("faq.no_answer_desc","Наша служба поддержки готова помочь вам 24/7")}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e.jsx("a",{href:"/contacts",className:"bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors",children:a("faq.contact_support","Связаться с поддержкой")}),e.jsx("a",{href:"tel:+998781501515",className:"border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors",children:"Позвонить: +998 78 150 15 15"})]})]})]})]})})};export{A as default};
