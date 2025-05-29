const socket = io();

$(() => {
    $('.total-pfp').hover(() => {
      $('.auth').css('width', '10em');
      $('.auth').css('padding', '15px');
      $('.auth').css('transform', 'skew(20deg)');
      
      $('.auth').css('transition-delay', '0s, 0s, 0s');
      $('.total-pfp').css('width', 'calc(1em + 10px + 10em)');
    }, () => {
      $('.auth').css('width', '0em');
      $('.auth').css('padding', '0px');
      $('.auth').css('transform', 'skew(0deg)');
      
      $('.auth').css('transition-delay', '0s, 0s, 0.5s');
      $('.total-pfp').css('width', 'calc(2em + 20px)');
    });
    
    $('.stats > div:nth-of-type(1)').hover(() => {
      $('.tool-tip').css('display', 'block');
      $('.tool-tip').text('Coins');
    }, () => {
      $('.tool-tip').css('display', 'none');
      $('.tool-tip').text('N/A');
    });
    
    $('.stats > div:nth-of-type(2)').hover(() => {
      $('.tool-tip').css('display', 'block');
      $('.tool-tip').text('Ranked Wins');
    }, () => {
      $('.tool-tip').css('display', 'none');
      $('.tool-tip').text('N/A');
    });
    
    $('.stats > div:nth-of-type(3)').hover(() => {
      $('.tool-tip').css('display', 'block');
      $('.tool-tip').text('Total Wins');
    }, () => {
      $('.tool-tip').css('display', 'none');
      $('.tool-tip').text('N/A');
    });
    
    $('.stats > div:nth-of-type(4)').hover(() => {
      $('.tool-tip').css('display', 'block');
      $('.tool-tip').text('Rank');
    }, () => {
      $('.tool-tip').css('display', 'none');
      $('.tool-tip').text('N/A');
    });
    
    $('.stats > div:nth-of-type(5)').hover(() => {
      $('.tool-tip').css('display', 'block');
      $('.tool-tip').text('Streak');
    }, () => {
      $('.tool-tip').css('display', 'none');
      $('.tool-tip').text('N/A');
    });
    
    $('.auth').click(e => e.preventDefault());
    $('.total-pfp').click(e => e.preventDefault());
  });
  
  $(document).mousemove(function(event){
    $(".tool-tip").css("top", `${event.pageY}px`);
    $(".tool-tip").css("left", `${event.pageX}px`);
  });