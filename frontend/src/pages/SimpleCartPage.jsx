// Простая страница корзины для тестирования
const SimpleCartPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-green-600">СТРАНИЦА КОРЗИНЫ РАБОТАЕТ!</h1>
      <p className="text-xl mt-4">Если вы видите это - значит роутинг работает</p>
      
      <div className="mt-8 bg-blue-100 p-4 rounded">
        <h2 className="text-2xl font-bold">Информация о корзине:</h2>
        <p className="mt-2">Товаров в корзине: 0</p>
        <p>Общая сумма: 0 сум</p>
        
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Перейти к оформлению заказа
        </button>
      </div>
      
      <div className="mt-8 bg-yellow-100 p-4 rounded">
        <h2 className="text-2xl font-bold">Действия с корзиной:</h2>
        <div className="mt-4 space-x-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Добавить тестовый товар
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Очистить корзину
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleCartPage





