const socket = io();

let userData = {
  
};

let referrableID;

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
  
  $('#room-btn').click(() => toggleRoomModal());
  $('.room-modal-close').click(() => toggleRoomModal());
  
  $('#signup').click(() => toggleSignupModal());
  $('.signup-modal-close').click(() => toggleSignupModal());
  
  $('#login').click(() => toggleLoginModal());
  $('.login-modal-close').click(() => toggleLoginModal());
  
  $('.auth').click(e => e.preventDefault());
  $('.total-pfp').click(e => e.preventDefault());


  $('#signup-submit').click(() => {
    let data = {
        name: $('#signup-name').val(),
        username: $('#signup-username').val(),
        passcode: $('#signup-password').val()
    }
    socket.emit('signup-submit-req', data);
  });

  $('#login-submit').click(() => {
    console.log(1);
    let data = {
        username: $('#login-username').val(),
        passcode: $('#login-password').val()
    }
    socket.emit('login-submit-req', data);
  });
});

socket.on('login-submit-res', data => {
    console.log('4');
    userData = data;
    loadData();
});

socket.on('signup-submit-res', data => {
    if (data.success) {
        let { success, docId, ...realData } = data;
        userData = realData;
        loadData();
    } else {
        alert('Duplicate Account or Other Error');
    }
});

$(document).mousemove(function(event){
  $(".tool-tip").css("top", `${event.pageY}px`);
  $(".tool-tip").css("left", `${event.pageX}px`);
});

function toggleRoomModal() {
  if ($('.room-modal').css('top') == '50px') {
    $('.room-modal').css('top', '-100vh');
    $('.blur-div').fadeOut();
  } else {
    $('.room-modal').css('top', '50px');
    $('.blur-div').fadeIn();
  }
}

function toggleSignupModal() {
  if ($('.signup-modal').css('top') == '50px') {
    $('.signup-modal').css('top', '-100vh');
    $('.blur-div').fadeOut();
  } else {
    $('.signup-modal').css('top', '50px');
    $('.blur-div').fadeIn();
  }
}

function toggleLoginModal() {
  if ($('.login-modal').css('top') == '50px') {
    $('.login-modal').css('top', '-100vh');
    $('.blur-div').fadeOut();
  } else {
    $('.login-modal').css('top', '50px');
    $('.blur-div').fadeIn();
  }
}

function loadData() {
  if (userData.name) {
    $('.welcome').show();
    $('.signup').hide();
    $('.welcome').text(`Hi, ${userData.name}`);
  } else {
    $('.signup').show();
    $('.welcome').hide();
  }


  $('#coins-data').text(`${(userData.coins) ? userData.coins : ''}`);
  $('#ranked-wins-data').text(`${(userData.rankedWins) ? userData.rankedWins : ''}`);
  $('#total-wins-data').text(`${(userData.totalWins) ? userData.totalWins : ''}`);
  $('#rank-data').text(`${(userData.rank) ? userData.rank : ''}`);
  $('#streak-data').text(`${(userData.streak) ? userData.streak : ''}`);
}

loadData();

const inputs = document.querySelectorAll('input');

inputs.forEach(el => {
  el.addEventListener('blur', e => {
    if(e.target.value) {
      e.target.classList.add('dirty');
    } else {
      e.target.classList.remove('dirty');
    }
  })
});

