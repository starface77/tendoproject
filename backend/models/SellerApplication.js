const mongoose = require('mongoose');

const SellerApplicationSchema = new mongoose.Schema({
  // Пользователь, подающий заявку (опционально для неавторизованных)
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Разрешаем заявки без авторизации
  },
  
  // Статус заявки
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'documents_required'],
    default: 'pending'
  },
  
  // Информация о бизнесе
  businessInfo: {
    companyName: {
      type: String,
      required: [true, 'Необходимо указать название компании'],
      maxlength: [100, 'Название компании не может быть длиннее 100 символов']
    },
    registrationNumber: {
      type: String,
      required: [true, 'Необходимо указать регистрационный номер'],
      maxlength: [50, 'Регистрационный номер не может быть длиннее 50 символов']
    },
    taxId: {
      type: String,
      required: [true, 'Необходимо указать налоговый номер'],
      maxlength: [50, 'Налоговый номер не может быть длиннее 50 символов']
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    description: {
      type: String,
      maxlength: [500, 'Описание не может быть длиннее 500 символов']
    },
    website: {
      type: String,
      maxlength: [100, 'URL сайта не может быть длиннее 100 символов']
    },
    phone: {
      type: String,
      required: [true, 'Необходимо указать телефон'],
      maxlength: [20, 'Телефон не может быть длиннее 20 символов']
    }
  },
  
  // Контактная информация
  contactInfo: {
    contactPerson: {
      type: String,
      required: [true, 'Необходимо указать контактное лицо'],
      maxlength: [100, 'Имя контактного лица не может быть длиннее 100 символов']
    },
    position: {
      type: String,
      maxlength: [100, 'Должность не может быть длиннее 100 символов']
    },
    email: {
      type: String,
      required: [true, 'Необходимо указать email'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Пожалуйста, введите корректный email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Необходимо указать телефон'],
      maxlength: [20, 'Телефон не может быть длиннее 20 символов']
    }
  },
  
  // Документы
  documents: {
    businessLicense: {
      type: String, // URL файла
      required: [true, 'Необходимо приложить лицензию']
    },
    taxCertificate: {
      type: String, // URL файла
      required: [true, 'Необходимо приложить налоговый сертификат']
    },
    identityDocument: {
      type: String, // URL файла
      required: [true, 'Необходимо приложить документ, удостоверяющий личность']
    },
    bankStatement: {
      type: String // URL файла (опционально)
    },
    additionalDocuments: [{
      name: String,
      url: String
    }]
  },
  
  // Предполагаемые категории товаров
  productCategories: [{
    type: String,
    required: true
  }],
  
  // Ожидаемый месячный оборот
  expectedMonthlyRevenue: {
    type: Number,
    min: [0, 'Оборот не может быть отрицательным']
  },
  
  // Опыт продаж
  salesExperience: {
    type: String,
    enum: ['none', 'less_than_1_year', '1_3_years', '3_5_years', 'more_than_5_years', 'over_5_years'],
    required: true
  },
  
  // Дополнительная информация от заявителя
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Дополнительная информация не может быть длиннее 1000 символов']
  },
  
  // Административные поля
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User' // Админ, который обработал заявку
  },
  
  processedAt: {
    type: Date
  },
  
  adminNotes: {
    type: String,
    maxlength: [500, 'Заметки администратора не могут быть длиннее 500 символов']
  },
  
  rejectionReason: {
    type: String,
    maxlength: [500, 'Причина отклонения не может быть длиннее 500 символов']
  },
  
  // Требуемые документы (если статус documents_required)
  requiredDocuments: [{
    type: String
  }],
  
  // Метаданные
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновляем updatedAt при каждом сохранении
SellerApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Индексы для оптимизации запросов
SellerApplicationSchema.index({ userId: 1 });
SellerApplicationSchema.index({ status: 1 });
SellerApplicationSchema.index({ createdAt: -1 });
SellerApplicationSchema.index({ 'businessInfo.companyName': 1 });

module.exports = mongoose.model('SellerApplication', SellerApplicationSchema);