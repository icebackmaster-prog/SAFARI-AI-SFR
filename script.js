/* =====================================================
   SAFARI AI V1 - MAIN ENGINE
   Created by ICEBACK MASTER TECH
   Powered by SAFARI TECHNOLOGY & ICEBACK MASTER TECH
===================================================== */


console.log("🦁 SAFARI AI V1 Loading...");



const SAFARI_CONFIG = {

creator:"ICEBACK MASTER TECH",

powered:"SAFARI TECHNOLOGY & ICEBACK MASTER TECH",

supportEmail:"safaritechcompany@gmail.com",

ownerPhone:"+263788377887",

ownerEmail:"icebackmaster@gmail.com",

channel:
"https://whatsapp.com/channel/0029VbC0Vi50wajpq5TlRi0B",


chatAPI:
"https://api.hostify.co.zw/api/ai/gemini",


imageAPI:
"https://image.pollinations.ai/prompt/"

};





// ELEMENTS


const loginOverlay =
document.getElementById("loginOverlay");

const app =
document.getElementById("app");

const loginBtn =
document.getElementById("loginBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const sendBtn =
document.getElementById("sendBtn");

const userInput =
document.getElementById("userInput");

const chatMessages =
document.getElementById("chatMessages");

const themeBtn =
document.getElementById("themeBtn");

const generateImageBtn =
document.getElementById("generateImage");

const imagePrompt =
document.getElementById("imagePrompt");

const generatedImage =
document.getElementById("generatedImage");

const explainCode =
document.getElementById("explainCode");

const codeInput =
document.getElementById("codeInput");

const codeResult =
document.getElementById("codeResult");







// LOGIN SYSTEM


loginBtn.onclick = ()=>{


let email =
document.getElementById("loginEmail").value;


let password =
document.getElementById("loginPassword").value;



if(email.length < 3 || password.length < 3){

alert("Please enter valid login details");

return;

}



localStorage.setItem(
"safari_user",
email
);



loginOverlay.classList.add("hidden");

app.classList.remove("hidden");


showNotification(
"Welcome to SAFARI AI 🦁"
);


};






// AUTO LOGIN


window.onload=()=>{


let user =
localStorage.getItem("safari_user");


if(user){

loginOverlay.classList.add("hidden");

app.classList.remove("hidden");

}



};







// LOGOUT


logoutBtn.onclick=()=>{


localStorage.removeItem(
"safari_user"
);


location.reload();


};








// CHAT FUNCTION


sendBtn.onclick=sendMessage;


userInput.addEventListener(
"keydown",
(e)=>{


if(e.key==="Enter"){

sendMessage();

}


});





async function sendMessage(){


let message =
userInput.value.trim();


if(!message)return;



addMessage(
message,
"user"
);



userInput.value="";



let loading =
addMessage(
"SAFARI AI is thinking... 🤖",
"ai"
);



try{


let response =
await fetch(
SAFARI_CONFIG.chatAPI,
{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

message:message

})

}

);



let data =
await response.json();



loading.innerHTML =
data.reply ||
data.message ||
"SAFARI AI completed your request.";



}

catch(error){


loading.innerHTML =
offlineAI(message);



}



saveChat();


}





function addMessage(text,type){


let div =
document.createElement("div");


div.className =
type==="user"
?"user-message"
:"ai-message";


div.innerHTML=text;



chatMessages.appendChild(div);


chatMessages.scrollTop =
chatMessages.scrollHeight;


return div;


}






// OFFLINE AI BACKUP


function offlineAI(question){


question =
question.toLowerCase();



if(question.includes("hello"))
return "Hello 👋 I am SAFARI AI. How can I help you?";



if(question.includes("who created"))
return "SAFARI AI was created by ICEBACK MASTER TECH and powered by SAFARI TECHNOLOGY.";



if(question.includes("math"))
return "I can help with mathematics, algebra, geometry and calculations.";



if(question.includes("code"))
return "I can explain and help create HTML, CSS, JavaScript and other programming projects.";



return "I am SAFARI AI. Your smart assistant for technology, learning, creativity and daily tasks.";

}








// IMAGE GENERATOR


generateImageBtn.onclick=()=>{


let prompt =
imagePrompt.value.trim();


if(!prompt){

alert("Enter image description");

return;

}



generatedImage.src =
SAFARI_CONFIG.imageAPI
+
encodeURIComponent(prompt);



showNotification(
"Creating AI image..."
);



};








// CODE ASSISTANT


explainCode.onclick=()=>{


let code =
codeInput.value.trim();



if(!code){

codeResult.innerHTML=
"Paste code first.";

return;

}



codeResult.innerHTML=
`
<b>SAFARI AI Code Analysis:</b>
<br><br>
Your code has been received.
I can help explain, debug and improve it.
<br><br>
Suggestions:
<br>
• Check syntax errors
<br>
• Improve security
<br>
• Optimize performance
`;

};








// DARK MODE


themeBtn.onclick=()=>{


let html =
document.documentElement;


if(html.dataset.theme==="dark"){


html.dataset.theme="light";


themeBtn.innerHTML="☀️";


}

else{


html.dataset.theme="dark";


themeBtn.innerHTML="🌙";


}


};









// CHAT STORAGE


function saveChat(){


localStorage.setItem(

"safari_chat",

chatMessages.innerHTML

);


}



let oldChat =
localStorage.getItem(
"safari_chat"
);



if(oldChat){

chatMessages.innerHTML=oldChat;

}








// NOTIFICATION


function showNotification(text){


let note =
document.createElement("div");


note.innerHTML=text;


note.style.position="fixed";

note.style.bottom="20px";

note.style.right="20px";

note.style.padding="15px";

note.style.background="#6366f1";

note.style.color="white";

note.style.borderRadius="15px";

note.style.zIndex="9999";


document.body.appendChild(note);



setTimeout(()=>{

note.remove();

},3000);


}








// PARTICLE BACKGROUND


const canvas =
document.getElementById(
"particlesCanvas"
);


if(canvas){


const ctx =
canvas.getContext("2d");


canvas.width =
innerWidth;


canvas.height =
innerHeight;



let particles=[];



for(let i=0;i<80;i++){


particles.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

size:Math.random()*3,

speed:Math.random()*1

});


}



function animate(){


ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);



particles.forEach(p=>{


ctx.beginPath();


ctx.arc(
p.x,
p.y,
p.size,
0,
Math.PI*2
);


ctx.fillStyle=
"rgba(99,102,241,.5)";


ctx.fill();



p.y-=p.speed;



if(p.y<0)
p.y=canvas.height;


});



requestAnimationFrame(animate);


}



animate();


}







console.log(
"🦁 SAFARI AI V1 Ready"
);
