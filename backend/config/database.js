const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServerInstance = null;

/**
 * Подключение к MongoDB
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tendo-market';

    console.log('🔄 Подключение к MongoDB...');
    console.log('📍 URI:', mongoUri);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB подключен:', conn.connection.host);

  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    
    // Пробуем запустить локальный in-memory сервер как fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Попытка запуска локального in-memory MongoDB...');
        
        memoryServerInstance = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'tendo-market'
          }
        });
        
        const memoryUri = memoryServerInstance.getUri();
        console.log('📍 Fallback URI:', memoryUri);
        
        await mongoose.connect(memoryUri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        
        console.log('✅ Подключен к in-memory MongoDB');
        
      } catch (fallbackErr) {
        console.error('🔴 Не удалось запустить fallback in-memory MongoDB:', fallbackErr.message);
        console.error('💡 Убедитесь что MongoDB запущен локально или исправьте MONGO_URI');
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

/**
 * Закрытие соединения с БД
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 Соединение с MongoDB закрыто');
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
      console.log('🛑 In-memory MongoDB остановлен');
    }
  } catch (error) {
    console.error('❌ Ошибка при закрытии соединения:', error.message);
  }
};

/**
 * Обработка событий подключения
 */
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose подключен к MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Ошибка Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose отключен от MongoDB');
});

// Корректное закрытие при завершении процесса
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  closeDB
};

