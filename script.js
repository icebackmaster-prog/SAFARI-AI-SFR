/* =====================================================
 SAFARI AI V1 - AI ENGINE
 Created by ICEBACK MASTER TECH
 Powered by SAFARI TECHNOLOGY & ICEBACK MASTER TECH
===================================================== */

"use strict";


const SAFARI = {

apis:{

gemini:"https://api.hostify.co.zw/api/ai/gemini",

deepsearch:"https://api.hostify.co.zw/api/ai/deepsearch",

unlimited:"https://api.hostify.co.zw/api/ai/unlimited",

notegpt:"https://api.hostify.co.zw/api/ai/notegpt"

},


image:
"https://image.pollinations.ai/prompt/",


creator:
"ICEBACK MASTER TECH",


powered:
"SAFARI TECHNOLOGY & ICEBACK MASTER TECH",


email:
"safaritechcompany@gmail.com",


owner:
"+263788377887",


channel:
"https://whatsapp.com/channel/0029VbC0Vi50wajpq5TlRi0B"

};





document.addEventListener("DOMContentLoaded",()=>{

setupChat();

setupImage();

setupCode();

setupTheme();

setupClear();

setupVoice();

loadChat();

});






/* CHAT */


function setupChat(){

let send=document.getElementById("sendBtn");

let input=document.getElementById("userInput");


if(!send)return;


send.onclick=sendMessage;


input.addEventListener("keydown",e=>{

if(e.key==="Enter")
sendMessage();

});


}



async function sendMessage(){

let input=document.getElementById("userInput");

let text=input.value.trim();


if(!text)return;


addMessage(text,"user");

input.value="";


let box=addMessage(
"SAFARI AI is thinking 🤖...",
"ai"
);


let reply=await safariAI(text);


box.innerHTML=reply;


saveChat();

}







async function safariAI(question){



let local=knowledge(question);


if(local)
return local;



let apis=[

SAFARI.apis.gemini,

SAFARI.apis.deepsearch,

SAFARI.apis.unlimited,

SAFARI.apis.notegpt

];



for(let api of apis){


try{


let res=await fetch(api,{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

message:question,

prompt:question,

text:question

})


});



let data=await res.json();


let answer=

data.reply||
data.message||
data.response||
data.answer;



if(answer)
return answer;



}catch(e){

console.log("AI error",api);

}


}



return "🦁 SAFARI AI could not connect right now. Try again.";

}







/* SAFARI KNOWLEDGE */


function knowledge(q){


q=q.toLowerCase();



if(q.includes("who created") ||
q.includes("creator")){


return `

🦁 SAFARI AI V1

Created by:
ICEBACK MASTER TECH

Powered by:
SAFARI TECHNOLOGY & ICEBACK MASTER TECH

`;

}




if(q.includes("email") ||
q.includes("contact")){


return `

📧 SAFARI TECHNOLOGY

Email:
safaritechcompany@gmail.com

Owner:
icebackmaster@gmail.com

Phone:
+263788377887

`;

}





if(q.includes("channel") ||
q.includes("whatsapp")){


return `

📢 SAFARI TECHNOLOGY WhatsApp Channel:

${SAFARI.channel}

`;

}





if(q.includes("school") ||
q.includes("math") ||
q.includes("science")){


return `

📚 SAFARI SCHOOL AI

I can help with:

✅ Mathematics
✅ Science
✅ Programming
✅ Homework
✅ Explanations
✅ Study help

Ask your question.

`;

}




if(q.includes("what can you do")){


return `

🦁 SAFARI AI V1 FEATURES:

🤖 AI Chat
🔎 Deep Search
📚 School AI
💻 Code Assistant
🎨 Image Studio
✍️ Writing Assistant
🚀 Technology Help

`;

}



return null;

}








function addMessage(text,type){


let box=document.getElementById("chatMessages");


let div=document.createElement("div");


div.className=
type==="user"?
"user-message":
"ai-message";


div.innerHTML=text;


box.appendChild(div);


box.scrollTop=box.scrollHeight;


return div;

}








/* IMAGE */


function setupImage(){

let btn=document.getElementById("generateImage");


if(!btn)return;


btn.onclick=()=>{


let prompt=document.getElementById("imagePrompt").value;


document.getElementById("generatedImage").src=

SAFARI.image+
encodeURIComponent(prompt);


};

}








/* CODE */


function setupCode(){


let btn=document.getElementById("explainCode");


if(!btn)return;


btn.onclick=()=>{


document.getElementById("codeResult").innerHTML=

"💻 SAFARI AI Code Assistant<br><br>Code received. I can help debug and improve it.";


};


}








/* THEME */


function setupTheme(){


let btn=document.getElementById("themeBtn");


if(btn){


btn.onclick=()=>{


document.documentElement.dataset.theme=

document.documentElement.dataset.theme==="dark"
?
"light"
:
"dark";


};

}


}








/* CLEAR */


function setupClear(){


let btn=document.getElementById("clearBtn");


if(btn){


btn.onclick=()=>{


document.getElementById("chatMessages").innerHTML=

"";


localStorage.removeItem("safari_chat");


};


}


}








/* VOICE */


function setupVoice(){


let btn=document.getElementById("voiceBtn");


if(!btn)return;


btn.onclick=()=>{


alert("Voice AI activated");


};


}








/* MEMORY */


function saveChat(){

let box=document.getElementById("chatMessages");


localStorage.setItem(
"safari_chat",
box.innerHTML
);


}



function loadChat(){


let old=localStorage.getItem("safari_chat");


let box=document.getElementById("chatMessages");


if(old && box)
box.innerHTML=old;


}


console.log("🦁 SAFARI AI V1 READY");
