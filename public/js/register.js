let pass1 = document.getElementById("psw")
let pass2 = document.getElementById("psw2")
let button = document.getElementById("register");
button.disabled =true;
let pas1;
let pas2;

//password validation
pass1.addEventListener("change",function(e){
  pas1=e.target.value

  if(pas1===pas2)
    button.disabled =false;
  else
    button.disabled = true
})
pass2.addEventListener("change",function(e){
  pas2=e.target.value;

  if(pas1===pas2)
    button.disabled =false;
  else
    button.disabled = true
})

