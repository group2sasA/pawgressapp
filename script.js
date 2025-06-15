// State & DOM
const loginScreen = document.getElementById('login-screen');
const petSelect = document.getElementById('pet-select-screen');
const appScreen = document.getElementById('app-screen');
const btnLogin = document.getElementById('btn-login');
const usernameInput = document.getElementById('user-name');
const passwordInput = document.getElementById('user-pass');
const petButtons = document.querySelectorAll('.choose-pet');
const petIcon = document.getElementById('pet-icon');
const shopButtons = document.querySelectorAll('.buy-item');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const toasty = document.getElementById('toast');
const progressBar = document.querySelector('#progress-bar span');
const petMood = document.getElementById('pet-mood');
const petHunger = document.getElementById('pet-hunger');
const petEnergy = document.getElementById('pet-energy');
const petPoints = document.getElementById('pet-points');
const houseItems = document.getElementById('house-items');

let userData = {};

// Utils
function save() { localStorage.setItem('pawgress_'+userData.name, JSON.stringify(userData)); }
function load(name) {
  const data = localStorage.getItem('pawgress_'+name);
  return data ? JSON.parse(data) : null;
}

// Login flow
btnLogin.onclick = () => {
  const name = usernameInput.value.trim();
  const pass = passwordInput.value;
  if(!name||!pass)return alert('Fix that'); // babe
  const saved = load(name);
  if(saved){
    if(saved.pass===pass){
      userData = saved; startApp();
    } else return alert('Nope wrong');
  } else {
    userData = {name,pass,pet:null,points:0,hunger:50,energy:50,tasks:[],decor:[]};
    petSelect.classList.remove('hidden');
  }
  loginScreen.classList.add('hidden');
};

// Pet & shop
petButtons.forEach(b=>{
  b.onclick=()=> {
    userData.pet = b.dataset.pet;
    petSelect.classList.add('hidden');
    startApp();
  };
});
shopButtons.forEach(b=>{
  b.onclick=()=> {
    const item=b.dataset.item;
    if(userData.points<10)return alert('Need 10 pts');
    userData.points-=10;
    if(!userData.decor.includes(item))userData.decor.push(item);
    refresh();
    save();
  };
});

// Tasks
taskForm.onsubmit=e=>{
  e.preventDefault();
  userData.tasks.push({text:taskInput.value,done:false});
  taskInput.value='';
  save(); refresh();
};

// Refresh UI
function refresh(){
  petIcon.textContent = userData.pet;
  petMood.textContent = moodText();
  petHunger.textContent = userData.hunger;
  petEnergy.textContent = userData.energy;
  petPoints.textContent = userData.points;
  houseItems.textContent = userData.decor.join(', ')||'none';

  // tasks
  taskList.innerHTML='';
  userData.tasks.forEach((t,i)=>{
    const div=document.createElement('div');
    div.className='task-item'+(t.done?' done':'');
    div.innerHTML=`
      <span><input type="checkbox"${t.done?' checked':''}/> ${t.text}</span>
      <button data-i="${i}">🗑️</button>`;
    div.querySelector('input').onchange=()=>toggleDone(i);
    div.querySelector('button').onclick=()=>deleteTask(i);
    taskList.appendChild(div);
  });
  updateProgress();
}

// Task handlers
function toggleDone(i){
  const t=userData.tasks[i];
  t.done=!t.done;
  toasty.style.display='block';
  setTimeout(()=>toasty.style.display='none',1500);
  if(t.done){
    userData.points+=5;
    userData.hunger=Math.max(0,userData.hunger-5);
    userData.energy=Math.min(100,userData.energy+5);
  }
  save(); refresh();
}

function deleteTask(i){
  userData.tasks.splice(i,1);
  save(); refresh();
}

// Progress bar + mood
function updateProgress(){
  const all=userData.tasks.length;
  const done=userData.tasks.filter(t=>t.done).length;
  progressBar.style.width= all?((done/all)*100)+'%':'0%';
}

function moodText(){
  return userData.energy<30||userData.hunger>70?'Sad':'Happy';
}

// Start app
function startApp(){
  appScreen.classList.remove('hidden');
  refresh();
}

// Auto-stat decay
setInterval(()=>{
  if(!userData.name)return;
  userData.hunger=Math.min(100,userData.hunger+2);
  userData.energy=Math.max(0,userData.energy-2);
  save();refresh();
},60000);


