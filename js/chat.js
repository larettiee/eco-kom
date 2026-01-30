const widget = document.getElementById("chat-widget");
const body = document.getElementById("chat-body");
const messages = document.getElementById("chat-messages");

setTimeout(() => {
  widget.classList.remove("hidden");
  showInitialOptions();
}, 1000);

function toggleChat() {
  body.style.display = body.style.display === "flex" ? "none" : "flex";
  body.style.flexDirection = "column";
}

function addBotMessage(text) {
  const div = document.createElement("div");
  div.className = "bot";
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addUserMessage(text) {
  const div = document.createElement("div");
  div.className = "user";
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("chat-text");
  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = "";

  setTimeout(() => {
    if (text.toLowerCase().includes("цена") || text.toLowerCase().includes("стоимость") || text.toLowerCase().includes("прайс")) {
      addBotMessage("Цены можно посмотреть в разделе «Цены» или скачать наш каталог 📄");
      showPriceOptions();
    } else if (text.toLowerCase().includes("контакт") || text.toLowerCase().includes("связь") || text.toLowerCase().includes("телефон")) {
      showContactOptions();
    } else if (text.toLowerCase().includes("продукц") || text.toLowerCase().includes("фильтр") || text.toLowerCase().includes("товар")) {
      addBotMessage("У нас большой ассортимент фильтров для различных областей применения! 🏭");
      setTimeout(() => {
        addBotMessage("Могу помочь с выбором фильтра или отправлю наш каталог продукции.");
        showProductOptions();
      }, 600);
    } else if (text.toLowerCase().includes("заказ") || text.toLowerCase().includes("купить") || text.toLowerCase().includes("приобрести")) {
      addBotMessage("Отлично! Для оформления заказа нам нужны ваши контактные данные.");
      showContactForm();
    } else {
      addBotMessage("Я вас понял 🙂 Для более точного ответа выберите один из вариантов ниже или уточните ваш вопрос.");
      showInitialOptions();
    }
  }, 600);
}

function showInitialOptions() {
  const botDiv = document.createElement("div");
  botDiv.className = "bot";
  botDiv.innerHTML = `
    <strong>Здравствуйте! 👋 Чем могу помочь?</strong>
    <div class="options">
      <button class="option-btn" onclick="selectOption('Узнать цены и скачать каталог')">💰 Узнать цены и скачать каталог</button>
      <button class="option-btn" onclick="selectOption('Выбрать фильтр для моего оборудования')">🏭 Выбрать фильтр для моего оборудования</button>
      <button class="option-btn" onclick="selectOption('Заказать продукцию или получить консультацию')">📞 Заказать продукцию или получить консультацию</button>
      <button class="option-btn" onclick="selectOption('Связаться с отделом продаж')">👥 Связаться с отделом продаж</button>
    </div>
  `;
  messages.appendChild(botDiv);
  messages.scrollTop = messages.scrollHeight;
}

function selectOption(text) {
  addUserMessage(text);
  
  setTimeout(() => {
    if (text.includes("цены") || text.includes("каталог")) {
      showPriceOptions();
    } else if (text.includes("фильтр") || text.includes("оборудования")) {
      addBotMessage("Для подбора фильтра мне нужно знать тип вашего оборудования и область применения.");
      setTimeout(() => {
        addBotMessage("Можете описать ваше оборудование или оставьте контакты - наш специалист свяжется с вами!");
        showContactForm();
      }, 800);
    } else if (text.includes("Заказать") || text.includes("консультацию") || text.includes("продаж")) {
      showContactOptions();
    }
  }, 600);
}

function showPriceOptions() {
  const botDiv = document.createElement("div");
  botDiv.className = "bot";
  botDiv.innerHTML = `
    <strong>Вы можете:</strong>
    <div class="options">
      <button class="option-btn" onclick="window.open('https://eco-kom.com/wp-content/uploads/2018/04/Каталог-Eco-kom-общий.pdf', '_blank')">📥 Скачать общий каталог (PDF)</button>
      <button class="option-btn" onclick="window.open('https://eco-kom.com/wp-content/uploads/2018/04/Каталог-Eco-kom-рукава.pdf', '_blank')">📥 Скачать каталог рукавов (PDF)</button>
      <button class="option-btn" onclick="selectOption('Получить коммерческое предложение')">📋 Получить коммерческое предложение</button>
      <button class="option-btn" onclick="selectOption('Уточнить стоимость конкретного фильтра')">🔍 Уточнить стоимость конкретного фильтра</button>
    </div>
    <div class="contacts-info">
      <strong>Или свяжитесь с нами напрямую:</strong><br>
      📞 Телефон: <strong>8 (495) 544-54-08</strong><br>
      ✉️ Email: <strong>sales@eco-kom.ru</strong>
    </div>
  `;
  messages.appendChild(botDiv);
  messages.scrollTop = messages.scrollHeight;
}

function showContactOptions() {
  const botDiv = document.createElement("div");
  botDiv.className = "bot";
  botDiv.innerHTML = `
    <strong>Свяжитесь с нами удобным способом:</strong>
    <div class="contacts-info">
      <strong>📞 Телефон:</strong> 8 (495) 544-54-08<br>
      <strong>✉️ Email:</strong> sales@eco-kom.ru<br>
      <strong>📧 Доп. email:</strong> info-filter@eco-kom.ru<br>
      <strong>🏢 Адрес:</strong> г. Подольск, 1-й Деловой проезд, д.5
    </div>
    <div class="options" style="margin-top: 15px;">
      <button class="option-btn" onclick="selectOption('Мне нужен обратный звонок')">📲 Мне нужен обратный звонок</button>
      <button class="option-btn" onclick="selectOption('Хочу отправить запрос на email')">✉️ Хочу отправить запрос на email</button>
      <button class="option-btn" onclick="selectOption('У меня есть вопросы по продукции')">❓ У меня есть вопросы по продукции</button>
    </div>
  `;
  messages.appendChild(botDiv);
  messages.scrollTop = messages.scrollHeight;
}

function showProductOptions() {
  const botDiv = document.createElement("div");
  botDiv.className = "bot";
  botDiv.innerHTML = `
    <strong>Выберите категорию:</strong>
    <div class="options">
      <button class="option-btn" onclick="selectOption('Фильтры для промышленной вентиляции')">🏭 Фильтры для промышленной вентиляции</button>
      <button class="option-btn" onclick="selectOption('Фильтры для кондиционирования')">❄️ Фильтры для кондиционирования</button>
      <button class="option-btn" onclick="selectOption('Фильтры для чистых помещений')">🧼 Фильтры для чистых помещений</button>
      <button class="option-btn" onclick="selectOption('Фильтры для пищевой промышленности')">🍽️ Фильтры для пищевой промышленности</button>
      <button class="option-btn" onclick="selectOption('Другое оборудование')">⚙️ Другое оборудование</button>
    </div>
  `;
  messages.appendChild(botDiv);
  messages.scrollTop = messages.scrollHeight;
}

function showContactForm() {
  const botDiv = document.createElement("div");
  botDiv.className = "bot";
  botDiv.innerHTML = `
    <strong>Оставьте свои контактные данные, и мы свяжемся с вами в течение 15 минут:</strong>
    <div class="contact-form">
      <input type="text" id="contact-name" placeholder="Ваше имя">
      <input type="tel" id="contact-phone" placeholder="Ваш телефон">
      <input type="email" id="contact-email" placeholder="Email (необязательно)">
      <button onclick="submitContactForm()">📨 Отправить контакты</button>
    </div>
    <div class="contacts-info" style="margin-top: 10px;">
      <strong>Или свяжитесь сами:</strong><br>
      Телефон: <strong>8 (495) 544-54-08</strong><br>
      Работаем: Пн-Сб 8:00-18:00
    </div>
  `;
  messages.appendChild(botDiv);
  messages.scrollTop = messages.scrollHeight;
}

function submitContactForm() {
  const name = document.getElementById("contact-name").value.trim();
  const phone = document.getElementById("contact-phone").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  
  if (!name || !phone) {
    addBotMessage("Пожалуйста, заполните как минимум имя и телефон.");
    return;
  }
  
  addUserMessage(`Меня зовут ${name}, телефон: ${phone}${email ? `, email: ${email}` : ''}`);
  
  setTimeout(() => {
    addBotMessage(`Спасибо, ${name}! Ваши контакты получены. 🎯`);
    setTimeout(() => {
      addBotMessage("Наш менеджер свяжется с вами по телефону " + phone + " в течение 15 минут.");
      setTimeout(() => {
        addBotMessage("Если у вас есть срочный вопрос, звоните прямо сейчас: 8 (495) 544-54-08");
      }, 800);
    }, 600);
  }, 600);

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.innerHTML = '<p style="color: green; text-align: center;">✅ Данные отправлены!</p>';
  }
}

document.getElementById("chat-text").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

window.toggleChat = toggleChat;
window.selectOption = selectOption;
window.sendMessage = sendMessage;
window.submitContactForm = submitContactForm;