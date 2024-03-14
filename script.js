document.addEventListener("DOMContentLoaded", function() {

    var queryString = window.location.search;

    // Создаем новый объект URLSearchParams, передавая в него строку запроса
    var searchParams = new URLSearchParams(queryString);

        // Получаем значение параметра 'param1'
    var param1Value = searchParams.get('req');


    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const completeButton = document.getElementById('complete-button');
  
    function showCompleteButton() {
      completeButton.style.display = 'block';
      progressBar.style.display = 'none';
      progressText.style.display = 'none';
    }
  
    let progressWidth = 0; // Початкове значення ширини прогресу
    const animationDuration = 50000; // Тривалість анімації у мілісекундах (10 секунд)
  
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
    if(param1Value){
        const concontainer = document.getElementById('container');
        concontainer.style.display = "none";
        animate();
    }
    else{
        const bottom_center = document.getElementById('bottom-center');
        bottom_center.style.display = "none";
        
    }
    


    const myButton = document.getElementById('complete-button');
    let tg = window.Telegram.WebApp;
    // Додаємо обробник подій для кліку на кнопку
    myButton.addEventListener('click', function() {
        // Получаем строку запроса из текущего URL
        

        try{
            tg.sendData(param1Value);
        } catch(e){
            alert(e);
        }
        
    });
    
  }
  
  
  
  );
  
