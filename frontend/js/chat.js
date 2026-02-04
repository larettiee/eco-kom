console.log('chat.js загружается...');

const API_URL = 'http://localhost:5000';
let chatSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
let currentContext = '';

// Функция показа вариантов каталогов
window.showCatalogOptions = function() {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  
  // Добавляем сообщение пользователя (что он хочет каталоги)
  addUserMessage('Хочу получить каталоги');
  
  // Ответ бота с кнопками через задержку
  setTimeout(() => {
    const catalogDiv = document.createElement('div');
    catalogDiv.className = 'bot';
    catalogDiv.style.padding = '15px';
    catalogDiv.style.margin = '10px 0';
    catalogDiv.style.background = '#f0f9ff';
    catalogDiv.style.borderRadius = '10px';
    
    catalogDiv.innerHTML = `
      <strong style="display:block; margin-bottom:10px;">Выберите каталог для скачивания:</strong>
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a href="https://eco-kom.com/wp-content/uploads/2018/04/%D0%9A%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3-Eco-kom-%D0%BE%D0%B1%D1%89%D0%B8%D0%B9.pdf" 
           target="_blank"
           style="background:#3b82f6; color:white; text-decoration:none; text-align:center; 
                  padding:12px; border-radius:5px; font-weight:bold; display:block;">
          СКАЧАТЬ ОБЩИЙ КАТАЛОГ
        </a>
        
        <a href="https://eco-kom.com/wp-content/uploads/2018/04/%D0%9A%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3-Eco-kom-%D1%80%D1%83%D0%BA%D0%B0%D0%B2%D0%B0.pdf" 
           target="_blank"
           style="background:#8b5cf6; color:white; text-decoration:none; text-align:center; 
                  padding:12px; border-radius:5px; font-weight:bold; display:block;">
         СКАЧАТЬ КАТАЛОГ РУКАВОВ
        </a>
      </div>
      
      <div style="margin-top:15px; padding:10px; background:#fef3c7; border-radius:5px; font-size:14px;">
        <strong>Нужна отправка на email?</strong><br>
        <input type="email" id="catalog-email" placeholder="Введите ваш email" 
               style="width:100%; padding:8px; margin:5px 0; border:1px solid #ddd; border-radius:5px;">
        <button onclick="window.sendCatalogToEmail()" 
                style="background:#10b981; color:white; border:none; padding:8px 12px; 
                       width:100%; border-radius:5px; cursor:pointer;">
          Отправить каталоги на email
        </button>
      </div>
    `;
    
    messages.appendChild(catalogDiv);
    messages.scrollTop = messages.scrollHeight;
    
    // Сохраняем в БД
    saveMessageToDB('Предложил варианты каталогов для скачивания', 'bot', 'catalog');
    
  }, 500);
};

// Функция отправки каталогов на email
window.sendCatalogToEmail = function() {
  const email = document.getElementById('catalog-email')?.value.trim();
  const messages = document.getElementById('chat-messages');
  
  if (!email || !email.includes('@')) {
    addBotMessage('Пожалуйста, введите корректный email адрес');
    return;
  }
  
  // Сообщение пользователя с email
  addUserMessage(`Отправьте каталоги на email: ${email}`);
  
  // Ответ бота
  setTimeout(() => {
    addBotMessage(`✅ Каталоги отправлены на ${email}. Также вы можете скачать их напрямую по ссылкам выше.`);
    saveMessageToDB(`Отправил каталоги на email: ${email}`, 'bot', 'catalog');
    
    // Можно также сохранить email в таблицу requests
    fetch('http://localhost:5000/api/requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Пользователь каталога',
        phone: 'не указан',
        email: email,
        request_type: 'catalog',
        session_id: chatSessionId,
        message: 'Запрос каталогов на email'
      })
    }).then(r => r.json()).then(console.log);
    
  }, 800);
};

// Функция сохранения ВСЕХ сообщений в PostgreSQL
async function saveMessageToDB(messageText, senderType, requestType = null, extractedData = null) {
  try {
    console.log(`Сохраняю в БД: ${senderType} - "${messageText.substring(0, 50)}..."`);
    
    const data = {
      session_id: chatSessionId,
      message_text: messageText,
      sender_type: senderType,
      request_type: requestType || autoDetectRequestType(messageText),
      user_name: extractedData?.name || extractNameFromText(messageText),
      user_phone: extractedData?.phone || extractPhoneFromText(messageText),
      user_email: extractedData?.email || extractEmailFromText(messageText)
    };
    
    console.log('Отправляемые данные:', data);
    
    const response = await fetch(API_URL + '/api/chat/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Сохранено в БД. ID:', result.log_id);
    
    return result;
    
  } catch (error) {
    console.error('Ошибка сохранения в БД:', error);
    return null;
  }
}

// Автоматическое определение типа запроса
function autoDetectRequestType(text) {
  const textLower = text.toLowerCase();
  if (textLower.includes('цена') || textLower.includes('стоимость') || textLower.includes('прайс') || textLower.includes('сколько стоит')) {
    return 'price';
  } else if (textLower.includes('контакт') || textLower.includes('телефон') || textLower.includes('позвонить') || textLower.includes('связаться')) {
    return 'contacts';
  } else if (textLower.includes('заказ') || textLower.includes('купить') || textLower.includes('приобрести') || textLower.includes('оформить заказ')) {
    return 'order';
  } else if (textLower.includes('каталог') || textLower.includes('скачать') || textLower.includes('pdf') || textLower.includes('брошюра')) {
    return 'catalog';
  } else if (textLower.includes('консульт') || textLower.includes('помощь') || textLower.includes('подобрать') || textLower.includes('посоветуйте')) {
    return 'consultation';
  } else if (textLower.includes('фильтр') || textLower.includes('продукц') || textLower.includes('товар')) {
    return 'product_info';
  }
  return null;
}

// Извлечение данных из текста
function extractNameFromText(text) {
  if (text.includes('Меня зовут') || text.includes('меня зовут')) {
    const match = text.match(/[Мм]еня зовут\s+([^,\.!?\n]+)/i);
    return match ? match[1].trim() : null;
  }
  return null;
}

function extractPhoneFromText(text) {
  const phoneRegex = /(\+7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}/g;
  const match = text.match(phoneRegex);
  return match ? match[0].replace(/\D/g, '') : null;
}

function extractEmailFromText(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}


// Функция добавления сообщения пользователя
function addUserMessage(text, extractedData = null) {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  
  const div = document.createElement('div');
  div.className = 'user';
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  
  // Сохраняем в БД
  saveMessageToDB(text, 'user', null, null, extractedData);
}

// Функция добавления сообщения бота
function addBotMessage(text, requestType = null, productCategory = null) {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  
  const div = document.createElement('div');
  div.className = 'bot';
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  
  // Сохраняем в БД
  saveMessageToDB(text, 'bot', requestType, productCategory);
}


window.showContactForm = function() {
  console.log('window.showContactForm() ВЫЗВАНА!');
  
  const messages = document.getElementById('chat-messages');
  if (!messages) {
    console.error('Не найден chat-messages');
    return;
  }
  
  // Сообщение бота о форме
  const formDiv = document.createElement('div');
  formDiv.className = 'bot';
  formDiv.style.padding = '15px';
  formDiv.style.margin = '10px 0';
  formDiv.style.background = '#f0f9ff';
  formDiv.style.borderRadius = '10px';
  
  formDiv.innerHTML = `
    <strong style="display:block; margin-bottom:10px;">Оставьте контакты для связи:</strong>
    
    <div style="background:white; padding:15px; border-radius:8px;">
      <input type="text" id="fixed-contact-name" placeholder="Ваше имя" 
             style="width:100%; padding:10px; margin:5px 0; border:1px solid #ddd; border-radius:5px;">
      
      <input type="tel" id="fixed-contact-phone" placeholder="Телефон" 
             style="width:100%; padding:10px; margin:5px 0; border:1px solid #ddd; border-radius:5px;">
      
      <input type="email" id="fixed-contact-email" placeholder="Email (необязательно)" 
             style="width:100%; padding:10px; margin:5px 0; border:1px solid #ddd; border-radius:5px;">
      
      <button onclick="window.submitFixedContactForm()" 
              style="background:#4f46e5; color:white; border:none; padding:12px; width:100%; 
                     margin-top:10px; border-radius:5px; cursor:pointer; font-weight:bold;">
        Отправить контакты
      </button>
    </div>
    
    <div style="margin-top:10px; font-size:12px; color:#666;">
      Или позвоните: <strong>8 (495) 544-54-08</strong>
    </div>
  `;
  
  messages.appendChild(formDiv);
  messages.scrollTop = messages.scrollHeight;
  
  // Сохраняем сообщение бота о форме в БД
  saveMessageToDB('Предложил оставить контакты для связи', 'bot', 'contacts');
  
  console.log('Форма добавлена в чат');
};

window.submitFixedContactForm = async function() {
  console.log('submitFixedContactForm вызвана');
  
  const name = document.getElementById('fixed-contact-name')?.value.trim();
  const phone = document.getElementById('fixed-contact-phone')?.value.trim();
  const email = document.getElementById('fixed-contact-email')?.value.trim();
  
  console.log('Данные формы:', { name, phone, email });
  
  if (!name || !phone || !email) {
    addBotMessage("Пожалуйста, заполните все поля!");
    return;
  }
  
  // Сообщение пользователя
  const userMessage = `Меня зовут ${name}, телефон: ${phone}${email ? `, email: ${email}` : ''}`;
  addUserMessage(userMessage, { name, phone, email });
  
  // Сохраняем заявку в таблицу requests
  try {
    const response = await fetch('http://localhost:5000/api/requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        phone: phone,
        email: email || null,
        request_type: 'callback',
        session_id: chatSessionId,
        message: 'Заявка из формы чат-бота'
      })
    });
    
    const result = await response.json();
    console.log('API ответ на создание заявки:', result);
    
    if (result.success) {
      addBotMessage(`Спасибо, ${name}! Заявка #${result.request_id} принята.`);
      addBotMessage(`Наш менеджер свяжется с вами в течение 15 минут.`);
    } else {
      addBotMessage(`Спасибо! Ваши контакты получены. Мы скоро вам перезвоним.`);
    }
    

  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    addBotMessage(`Спасибо, ${name}! Ваши контакты получены.`);
    addBotMessage(`Мы свяжемся с вами по телефону ${phone}.`);
  }
  
  // Очищаем форму
  const formContainer = document.querySelector('.bot:last-child .contact-form');
  if (formContainer) {
    formContainer.innerHTML = '<p style="color: green; text-align: center; padding: 20px;">Данные отправлены!</p>';
  }
};

window.toggleChat = function() {
  const body = document.getElementById('chat-body');
  if (body) {
    body.style.display = body.style.display === 'flex' ? 'none' : 'flex';
  }
};

window.sendMessage = function() {
  const input = document.getElementById('chat-text');
  const messages = document.getElementById('chat-messages');
  
  if (!input || !messages) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  // Добавляем сообщение пользователя
  addUserMessage(text);
  input.value = '';
  
  // Ответ бота через задержку
  setTimeout(() => {
    const requestType = autoDetectRequestType(text);
    const productCategory = autoDetectProductCategory(text);
    
    let botResponse = '';
    
    if (requestType === 'price') {
      botResponse = 'Цены можно посмотреть в разделе «Цены» или скачать наш каталог \nДля точного расчета оставьте контакты.';
      addBotMessage(botResponse, 'price', productCategory);
      
      // Показываем кнопку для формы
      setTimeout(() => {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'bot';
        buttonDiv.innerHTML = `
          <button onclick="window.showContactForm()" 
                  style="background:#4f46e5; color:white; border:none; padding:10px 15px; 
                         margin-top:10px; border-radius:5px; cursor:pointer; width:100%;">
             Оставить контакты для расчета
          </button>
        `;
        messages.appendChild(buttonDiv);
        messages.scrollTop = messages.scrollHeight;
        
        saveMessageToDB('Предложил оставить контакты для расчета цены', 'bot', 'price', productCategory);
      }, 300);
      
    } else if (requestType === 'contacts') {
      botResponse = 'Наши контакты:\n 8 (495) 544-54-08\n sales@eco-kom.ru\n\nХотите чтобы мы вам перезвонили?';
      addBotMessage(botResponse, 'contacts');
      
    } else if (requestType === 'order') {
      botResponse = 'Отлично! Для оформления заказа нужны ваши контактные данные.';
      addBotMessage(botResponse, 'order');
      window.showContactForm();
      
    } else if (requestType === 'catalog') {
      botResponse = 'Отлично! Вот наши каталоги фильтров:';
      addBotMessage(botResponse, 'catalog');
      
      // Показываем кнопки каталогов
      setTimeout(() => {
        window.showCatalogOptions();
      }, 300);
      
    } else if (requestType === 'product_info') {
      botResponse = `У нас большой ассортимент фильтров для ${productCategory || 'различных областей'}! \nОпишите ваше оборудование или оставьте контакты для подбора.`;
      addBotMessage(botResponse, 'product_info', productCategory);
      
    } else {
      botResponse = 'Я вас понял! Чем конкретно могу помочь: ценами, контактами или подбором фильтра?';
      addBotMessage(botResponse);
    }
    
  }, 600);
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('chat инициализирован');
  
  const widget = document.getElementById('chat-widget');
  const messages = document.getElementById('chat-messages');
  const body = document.getElementById('chat-body');
  
  if (!widget || !messages || !body) {
    console.error('Не найдены элементы чат-бота');
    return;
  }
  
  // Инициализация чата
  setTimeout(() => {
    widget.classList.remove('hidden');
    
    // Приветственное сообщение
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'bot';
    welcomeDiv.innerHTML = `
      <strong>👋 Здравствуйте!</strong><br>
      Я чат-бот компании ЭКО-КОМ - производителя промышленных фильтров.<br><br>
  
      
      <button onclick="window.showContactForm()" 
              style="background:#4f46e5; color:white; border:none; padding:10px 15px; margin:5px; border-radius:5px; cursor:pointer; width:100%;">
         Заказать или проконсультироваться
      </button>
      
      <button onclick="window.showCatalogOptions()" 
              style="background:#8b5cf6; color:white; border:none; padding:10px 15px; margin:5px; border-radius:5px; cursor:pointer; width:100%;">
         Получить каталоги
      </button>
    `;
    
    messages.appendChild(welcomeDiv);
    messages.scrollTop = messages.scrollHeight;
    
    saveMessageToDB('Здравствуйте! Я чат-бот компании ЭКО-КОМ. Чем могу помочь?', 'bot', 'greeting');
    
    console.log(' Чат-бот запущен');
    
  }, 2000);
  
  // Обработчик Enter для ввода
  const input = document.getElementById('chat-text');
  if (input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        window.sendMessage();
      }
    });
  }
});

// Тестовые функции
window.sendMessageTest = function(message) {
  const input = document.getElementById('chat-text');
  if (input && message) {
    input.value = message;
    window.sendMessage();
  }
};

window.addUserMessage = addUserMessage;
window.addBotMessage = addBotMessage;
window.saveMessageToDB = saveMessageToDB;
window.autoDetectRequestType = autoDetectRequestType;
window.autoDetectProductCategory = autoDetectProductCategory;

console.log('Все функции chat-bot загружены и доступны');