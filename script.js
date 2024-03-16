document.addEventListener("DOMContentLoaded", function() {

    var queryString = window.location.search;

    // Создаем новый объект URLSearchParams, передавая в него строку запроса
    var searchParams = new URLSearchParams(queryString);

        // Получаем значение параметра 'param1'
    var param1Value = searchParams.get('req');

    let tg = window.Telegram.WebApp;
    
    // Почати анімацію
    if(param1Value){
        tg.sendData(param1Value);
        window.location.href = "https://www.profitablegatecpm.com/ftfx5mcg?key=affb32f08a6cec6b7611abc01504672a";
    }
    else{
      window.location.href = "https://www.profitablegatecpm.com/ftfx5mcg?key=affb32f08a6cec6b7611abc01504672a";
        
    }
    


    
    
  }
  
  
  
  );
  
