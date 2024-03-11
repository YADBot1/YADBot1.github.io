document.addEventListener("DOMContentLoaded", function() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const completeButton = document.getElementById('complete-button');
  
    function showCompleteButton() {
      completeButton.style.display = 'block';
      progressBar.style.display = 'none';
      progressText.style.display = 'none';
    }
  
    let progressWidth = 0; // Початкове значення ширини прогресу
    const animationDuration = 100000; // Тривалість анімації у мілісекундах (10 секунд)
  
    const animationStep = 100 / (animationDuration / 100); // Крок анімації для досягнення 100% за 10 секунд
  
    function animate() {
      if (progressWidth < 100) {
        progressWidth += animationStep;
        progressBar.style.width = progressWidth + '%';
        progressText.textContent = Math.round(progressWidth) + '%'; // Оновлення тексту з процентами
        requestAnimationFrame(animate);
      } else {
        showCompleteButton();
      }
    }
  
    // Почати анімацію
    animate();


    const myButton = document.getElementById('complete-button');
    let tg = window.Telegram.WebApp;
    // Додаємо обробник подій для кліку на кнопку
    myButton.addEventListener('click', function() {
        try{
            tg.sendData(tg.initData);
        } catch(e){
            alert(e);
        }
        
    });
    
  }
  
  
  
  );
  
