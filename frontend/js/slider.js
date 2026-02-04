document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('Инициализация слайдера...');
    
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const slider = document.querySelector('.hero-slider');
    
    // Если нет слайдов - выходим
    if (!slides || slides.length === 0) {
      console.log('Слайдер не найден на этой странице');
      return;
    }
    
    console.log(`Найдено ${slides.length} слайдов`);
    
    let currentSlide = 0;
    let slideInterval;
    
    // Безопасная функция показа слайда
    function showSlide(index) {
      try {
        // Проверяем индекс
        if (index < 0) index = 0;
        if (index >= slides.length) index = 0;
        
        // Скрываем все слайды
        slides.forEach(slide => {
          if (slide && slide.classList) {
            slide.classList.remove('active');
          }
        });
        
        // Убираем активность с точек
        if (dots && dots.length > 0) {
          dots.forEach(dot => {
            if (dot && dot.classList) {
              dot.classList.remove('active');
            }
          });
        }
        
        // Показываем текущий слайд
        if (slides[index] && slides[index].classList) {
          slides[index].classList.add('active');
        }
        
        // Активируем точку
        if (dots && dots[index] && dots[index].classList) {
          dots[index].classList.add('active');
        }
        
        currentSlide = index;
        
      } catch (error) {
        console.error('Ошибка в showSlide:', error);
      }
    }
    
    // Остальные функции (nextSlide, prevSlide и т.д.)
    function nextSlide() {
      let nextIndex = currentSlide + 1;
      if (nextIndex >= slides.length) {
        nextIndex = 0;
      }
      showSlide(nextIndex);
    }
    
    function prevSlide() {
      let prevIndex = currentSlide - 1;
      if (prevIndex < 0) {
        prevIndex = slides.length - 1;
      }
      showSlide(prevIndex);
    }
    
    function startAutoSlide() {
      if (slideInterval) clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoSlide() {
      if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      }
    }
    
    // Добавляем обработчики с проверкой
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        stopAutoSlide();
        prevSlide();
        startAutoSlide();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        stopAutoSlide();
        nextSlide();
        startAutoSlide();
      });
    }
    
    // Обработчики для точек
    if (dots && dots.length > 0) {
      dots.forEach((dot, index) => {
        if (dot) {
          dot.addEventListener('click', function() {
            stopAutoSlide();
            showSlide(index);
            startAutoSlide();
          });
        }
      });
    }
    
    // События для паузы
    if (slider) {
      slider.addEventListener('mouseenter', stopAutoSlide);
      slider.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Запускаем
    showSlide(0);
    startAutoSlide();
    
    console.log('Слайдер инициализирован');
    
  } catch (error) {
    console.error('Критическая ошибка в слайдере:', error);
  }
});