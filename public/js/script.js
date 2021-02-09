let spinner = $(".spinner");
let wholePage = $('.first-page');
let countries = $('.cards');
let registrationArea = $('.registration-area');

let signupForm = document.getElementById('sign-up-form');
let signupModal = $('#sign-up-modal');
let signupBtn = $('.sign-up-btn');

let signupUsernameError = $('.username-signup-error');
let signupFullNameError = $('.fullname-signup-error');
let signupPasswordError = $('.password-signup-error');



let loginForm = document.getElementById('login-form');
let loginModal = $('#login-modal');
let loginBtn = $('.login-btn');

let userForm = document.getElementById('user-form');
let userEditModal = $('#user-modal');
let userBtn = $('.user-btn');

let userUsernameError = $('.username-user-error');
let userFullNameError = $('.fullname-user-error');
let userNewPasswordError = $('.new-password-user-error');

let loginError = $('.login-error')
let signupError = $('.sign-up-error')

$(function () {
   $(document).scroll(function () {
      if (window.location.href.indexOf("profile.html") > -1) {
         return;
      }
      var $nav = $(".navbar");
      var $homeSection = $(".section-home")
      // var $navItem = $(".nav-item")
      $nav.toggleClass('scrolled', $(this).scrollTop() > ($homeSection.height()));
   });
});

$(document).ready(async () => {
   spinner.removeClass('loading');
   spinner.addClass('loaded');
   wholePage.removeClass('unable');
   validateUser();
   
   let numOfCountries;
   if (window.location.href.indexOf("profile.html") > -1) {
      console.log("profile page")
      var myHeaders = new Headers();
      myHeaders.append("Authorization", localStorage.getItem('userToken'));
      
      var requestOptions = {
         method: 'GET',
         headers: myHeaders,
         redirect: 'follow'
      };
      let userData = await fetch('/api/users/profile', requestOptions)
      userData = await userData.json()
      numOfCountries = userData.favoriteCountries.length;
       showFavCountries(0, 32)
       generatePagination(numOfCountries)
   } else {
      console.log("home page")
      numOfCountries = await fetch('/api/countries/noOfRecords')
      numOfCountries = await numOfCountries.json()
      console.log({ countries: numOfCountries.numOfCountries })
       showCountries(0, 32)
       generatePagination(numOfCountries.numOfCountries)
   }
   DOMFunctions()
})

async function showCountries(skip, limit) {
   countries.html(spinnerComponent())
   let arrayOfFav;
   try {
      var myHeaders = new Headers();
      myHeaders.append("Authorization", localStorage.getItem('userToken'));
   
      var requestOptions = {
         method: 'GET',
         headers: myHeaders,
         redirect: 'follow'
      };
      let userData = await fetch('/api/users/profile', requestOptions)
      userData = await userData.json()
      arrayOfFav = []
      userData.favoriteCountries.map((country) => {
         arrayOfFav.push(country._id)
      })
   } catch (error) {
      arrayOfFav = []
   }
   let data = await fetch(`/api/countries/?skip=${skip}&limit=${limit}`)
   data = await data.json()
   countries.html('')
   await data.countries.map((country) => {
      let isFavorie = arrayOfFav.includes(country._id)
      countries.append(countryCard(country, isFavorie))
   })
   DOMFunctions()
}
async function showFavCountries(skip, limit) {
   countries.html(spinnerComponent())
   let numOfCountries;
   try {
      var myHeaders = new Headers();
      myHeaders.append("Authorization", localStorage.getItem('userToken'));
      var requestOptions = {
         method: 'GET',
         headers: myHeaders,
         redirect: 'follow'
      };
      let data = await fetch(`/api/countries/favorites/?skip=${skip}&limit=${limit}`,requestOptions)
      data = await data.json()
      countries.html('')
      if(data.countries.length < 1){
         countries.append(cardsEmpty())
         return
      } 
      await data.countries.map((country) => {
         countries.append(countryCard(country, true))
      })
   } catch (error) {
      numOfCountries = 0;
   }
   DOMFunctions()
}

const countryCard = (country, isFavorie) => {
   let isDisabled = !(window.location.href.indexOf("profile.html") > -1)
   return `
   <div class="card m-3" id=${country._id} style="width: 18rem;">
      <div class=" text-end mt-2">
         <div class="text-end ">
            <i style="font-size:2rem;" class=" ${(isDisabled)?"":"disable"} ${(isFavorie) ? 'fav-icon' : ''} ${(isFavorie) ? 'fas' : 'far'} fa-heart"></i>
            <i style="font-size:2rem;" class=" ${(isDisabled)?"disable":""} ${(isFavorie) ? 'fav-icon' : ''} fas fa-times-circle"></i>
         <div>
      </div>
      <div class="card-body text-center">
         <h4 class="card-title">${country.country}</h4>
         <hr style="border:1px solid grey; width:50%; margin:auto" />
         <img src="https://www.countryflags.io/${country.country_iso2}/flat/64.png">
         <h4></h4>
         <div class="container text-start">
            <div class="numbers text-primary row"><span class="card-data col-8"><i class="fas fa-disease"></i> Confirmed:</span>${country.confirmed || "N/A"}<hr/></div>
            <div class="numbers text-danger row"><span class="card-data col-8"><i class="fas fa-skull"></i> Deaths:</span>${country.deaths || "N/A"}<hr/></div>
            <div class="numbers text-success row"><span class="card-data col-8"><i class="fas fa-plus-square"></i> Recovered:</span>${country.recovered || "N/A"}<hr/></div>
         </div>
      </div>
   </div>
   `
}

const generatePagination = (numOfCountries) => {
   let skip = 0;
   let limit = 32;
   let pagOfBtns;
   let numOfPages = (Math.ceil(numOfCountries / limit));
   for (let i = numOfPages; i >= 1; i--) {
      skip = 32 * (i - 1);
      pagOfBtns = `<li class="page-item pagiNum"><a class="page-link ${skip}-${limit}" href="#c_card">${i}</a></li>`
      $(pagOfBtns).insertAfter($(".page-item").first())
   }
   $('.pagiNum').first().addClass('active')
   return true
}

const spinnerComponent = () => {
   return `
        <div class="spinner-border text-dark" role="status">
            <span class="sr-only"></span>
        </div>
    `
}

function DOMFunctions() {
   $('.pagiNum').on('click', (e) => {
      console.log("pagination number clicked")
      $('.pagiNum.active').removeClass('active')
      e.target.parentElement.classList.add('active')

      let skip = Number(e.target.classList[1].split('-')[0])
      let limit = Number(e.target.classList[1].split('-')[1])
      if (window.location.href.indexOf("profile.html") > -1) {
         showFavCountries(skip, 32)
         return;
      }
      showCountries(skip, 32)
   })

   $('#next').on('click', () => {
      console.log("NEXT clicked")
      let index = Number($($('.pagiNum.active').children()[0]).html())
      if (index < $('.pagiNum').length) {
         let skip = Number($('.pagiNum.active').children()[0].classList[1].split('-')[0])
         let limit = Number($('.pagiNum.active').children()[0].classList[1].split('-')[1])
         if (window.location.href.indexOf("profile.html") > -1) {
            showFavCountries(skip + 32, limit)
         } else {
            showCountries(skip + 32, limit)
         }
         $('.pagiNum.active').removeClass('active')
         $('.pagiNum').eq(index).addClass('active')
      }
   })
   $('#prev').on('click', () => {
      console.log("PREV clicked")
      let index = Number($($('.pagiNum.active').children()[0]).html())
      if (index > 1) {
         let skip = Number($('.pagiNum.active').children()[0].classList[1].split('-')[0])
         let limit = Number($('.pagiNum.active').children()[0].classList[1].split('-')[1])
         showCountries(skip - 32, limit)
         $('.pagiNum.active').removeClass('active')
         $('.pagiNum').eq(index - 2).addClass('active')
      }
   })

   $('.sign-up-main-btn').on('click',()=>{
      console.log("enter")
      loginError.html('');
      signupForm.elements.usernameSignUp.value = '';
      signupForm.elements.passwordSignUp.value = '';
      signupForm.elements.fullNameSignUp.value = '';
      signupError.html('')
   })
   $('.login-main-btn').on('click',()=>{
      signupUsernameError.html('')
      signupFullNameError.html('')
      signupPasswordError.html('')
      loginForm.elements.usernameLogin.value = ''
      loginForm.elements.passwordLogin.value = ''
   })

   $('.logout').on('click', (e) => {
      e.stopPropagation();
      $('.logout').addClass('disabled')
      $('.fa-sign-out-alt').hide()
      $('.logout-spinner').removeClass('disable')
      setTimeout(() => {
         localStorage.setItem('userToken', '')
         location.replace('/')
         $('.logout-spinner').addClass('disable')
      }, 1500)
   })
   $('.show-fav').on('click', (e) => {
      e.stopPropagation()
      $('.show-fav').addClass('disabled')
      location.href = '/profile.html'
   })
   $('.fa-heart:not(.fav-icon)').hover(
      (e) => {
         $(e.target).addClass('fas')
         $(e.target).removeClass('far')
      },
      (e) => {
         $(e.target).removeClass('fas')
         $(e.target).addClass('far')
      }
   )
   $('.fa-heart:not(.fav-icon)').on('click', (e) => {
      let _id = e.target.parentElement.parentElement.parentElement.id;
      var myHeaders = new Headers();
      myHeaders.append("Authorization", localStorage.getItem('userToken'));
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({ "_id": _id });

      var requestOptions = {
         method: 'POST',
         headers: myHeaders,
         body: raw,
         redirect: 'follow'
      };
      let target = e.target
      
      fetch("/api/users/favorites/", requestOptions)
      .then(response => {
            console.log(response.status == 401)
            if(response.status == 401){
               $('#login-modal').modal('toggle');
               return
            }
            $(target).attr('class', '');
            $(target).addClass('fa fa-circle-o-notch fa-spin')
            $(target).off('mouseenter mouseleave')
            setTimeout(() => {
               $(target).attr('class', '');
               $(target).addClass('fav-icon')
               $(target).addClass('fas fa-heart')
            },1000)
         })
         .catch(error => console.log('error', error));
   })

   $('.fa-times-circle').on('click',(e)=>{
      let _id = e.target.parentElement.parentElement.parentElement.id;
      var myHeaders = new Headers();
      myHeaders.append("Authorization", localStorage.getItem('userToken'));
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({ "_id": _id });

      var requestOptions = {
         method: 'DELETE',
         headers: myHeaders,
         body: raw,
         redirect: 'follow'
      };
      
      fetch("/api/users/favorites/", requestOptions)
      .then(response => {
            console.log(response.status == 401)
            if(response.status == 401){
               return
            }
            $(`#${_id}`).animate({
               opacity: 0
             }, 700, function() {
               $(`#${_id}`).remove()
             });
            return response.json();
         })
         .then(response => {
            console.log(response.favoriteCountries)
            if(response.favoriteCountries.length < 1){
               countries.html(cardsEmpty())
            }
         })
         .catch(error => console.log('error', error));
   })
   $('.settings').on('click',()=>{
      userUsernameError.html('')
      userFullNameError.html('')
      userNewPasswordError.html('')
      userForm.elements.usernameUser.value = localStorage.getItem('username');
      userForm.elements.fullNameUser.value = localStorage.getItem('fullName');
   })
}

async function validateUser() {
   // btn-display-none
   try {
      var myHeaders = new Headers();
      myHeaders.append("Authorization", localStorage.getItem('userToken'));
   
      var requestOptions = {
         method: 'GET',
         headers: myHeaders,
         redirect: 'follow'
      };
      let data = await fetch('/api/users/profile', requestOptions)
      let status = await data.status;
      data = await data.json()
      console.log({ data, status })
      if (status == 201) {
         registrationArea.append(userIcon(data))
         $('.options').append(options)
         return
      }
      $('.btn-display-none').removeClass('btn-display-none')
   } catch (error) {
      console.log("Error: ", error)
   }
}

const userIcon = (user) => {
   return `
      <div class="rounded-pill user-icon p-2 ms-2 text-center" >
         <a href="/profile.html" class="user-icon-a">
            <h5>${user.username[0].toUpperCase()}</h5>   
         </a>
      <div>
   `
}

const options = () => {
   return `
   <li class="nav-item dropdown dropdown-options">
      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
         Options
      </a>
      <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
         <li><button class="dropdown-item show-fav"><i class="fab fa-gratipay"></i> Favorites</button></li>
         <li><button class="dropdown-item settings" data-bs-toggle="modal" data-bs-target="#user-modal"><i class="fas fa-cogs"></i> Settings</button></li>
         <li><hr class="dropdown-divider"></li>
         <li><button class="dropdown-item logout">
         <div class="spinner-border disable logout-spinner spinner-border-sm" role="status"></div><i class="fas fa-sign-out-alt"></i> Logout
         </button></li>
      </ul>
   </li>
   `
}


const cardsEmpty = () => {
   return ` 
      <div class="col-md-12 m">
         <img class="img-fluid" id="not-found" alt="Favorite not found" src="../assets/not-found.png"/>
         <h4 style='height: 12rem;'>Sorry! No cards were added to favorites :'(</h4>
      </div>
   `
}