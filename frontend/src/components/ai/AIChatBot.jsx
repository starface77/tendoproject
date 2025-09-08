import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiSend, FiX, FiBot, FiUser } from 'react-icons/fi'

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Привет! Я ИИ помощник вашего маркетплейса. Могу помочь с выбором товаров, поиском, сравнением цен и ответить на любые вопросы о покупках!',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Принудительно включаем скролл
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      const container = chatContainerRef.current
      container.style.overflowY = 'scroll'
      container.style.height = '400px'
      container.style.maxHeight = '400px'
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Здесь будет интеграция с реальным API
      // Пока используем mock ответы
      const aiResponse = await generateMockResponse(inputValue)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Ошибка чата:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Извините, произошла ошибка. Попробуйте позже.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockResponse = async (userInput) => {
    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const input = userInput.toLowerCase()
    
    if (input.includes('iphone') || input.includes('айфон')) {
      return 'iPhone 15 Pro Max - отличный выбор! У нас есть модели 128GB, 256GB и 512GB. Цены от 159,900 сум. Хотите сравнить с Samsung Galaxy S24 Ultra?'
    }
    
    if (input.includes('samsung') || input.includes('самсунг')) {
      return 'Samsung Galaxy S24 Ultra - топовая модель! 200MP камера, S Pen, 5000mAh батарея. Цена: 189,900 сум. Есть в наличии в черном и серебряном цветах.'
    }
    
    if (input.includes('доставка') || input.includes('delivery')) {
      return 'Доставка по Ташкенту - бесплатно от 500,000 сум. По Узбекистану - 50,000 сум. Время доставки: 1-3 дня. Есть экспресс доставка за 2 часа!'
    }
    
    if (input.includes('скидка') || input.includes('discount')) {
      return 'Сейчас действуют скидки: iPhone до 15%, Samsung до 20%, аксессуары до 50%! Используйте промокод WELCOME10 для дополнительной скидки 10%.'
    }
    
    if (input.includes('оплата') || input.includes('payment')) {
      return 'Принимаем: наличные, карты UzCard, Humo, Visa, MasterCard. Есть рассрочка на 12 месяцев без переплат. Безопасные платежи через SSL шифрование.'
    }
    
    if (input.includes('гарантия') || input.includes('warranty')) {
      return 'Гарантия на все товары: iPhone - 1 год, Samsung - 2 года, аксессуары - 6 месяцев. Сервисный центр в Ташкенте. Бесплатный ремонт по гарантии.'
    }
    
    return 'Спасибо за вопрос! Я могу помочь с выбором товаров, сравнением цен, информацией о доставке и оплате. Что именно вас интересует?'
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Кнопка чата */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <FiMessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FiBot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Помощник</h3>
                <p className="text-sm text-blue-100">Онлайн</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Сообщения */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50"
            style={{ height: '400px', overflowY: 'scroll' }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.type === 'user' ? (
                      <FiUser className="w-4 h-4" />
                    ) : (
                      <FiBot className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 max-w-xs px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm text-gray-600">ИИ печатает...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Поле ввода */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте вопрос..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIChatBot
