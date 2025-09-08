// Простая страница профиля для тестирования
const SimpleProfilePage = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600">СТРАНИЦА ПРОФИЛЯ РАБОТАЕТ!</h1>
      <p className="text-xl mt-4">Если вы видите это - значит роутинг работает</p>
      
      <div className="mt-8 bg-green-100 p-4 rounded">
        <h2 className="text-2xl font-bold">Простые чекбоксы:</h2>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#3b82f6'
              }}
            />
            <span className="ml-3">Email уведомления</span>
          </label>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#059669'
              }}
              defaultChecked
            />
            <span className="ml-3">SMS уведомления</span>
          </label>
        </div>
      </div>
      
      <div className="mt-8 bg-yellow-100 p-4 rounded">
        <h2 className="text-2xl font-bold">Информация о пользователе:</h2>
        <p className="mt-2">Имя: Тестовый пользователь</p>
        <p>Email: test@example.com</p>
        <p>Роль: user</p>
      </div>
    </div>
  )
}

export default SimpleProfilePage





