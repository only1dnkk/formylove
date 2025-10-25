const defaultOrder = ['intro', 'intro2', 'intro3', 'fake-alert', 'quest1', 'greeting'];
const order = defaultOrder.filter(id => document.getElementById(id));
let stepIndex = 0;
let musicStarted = false;

function showPanel(id){
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.add('active');

  if (id === 'greeting'){ 
    startCelebration();
  }
  if (id === 'memories') {
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'auto';
  } else {
    const mem = document.getElementById('memories');
    if (mem) mem.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden';
  }
  if (id === 'quest1') setupQuest1();
}

document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', (e)=>{
    makeRipple(e);
    if (!musicStarted) {
      startMusicSafely();
      musicStarted = true;
    }
    stepIndex = Math.min(stepIndex + 1, order.length - 1);
    showPanel(order[stepIndex]);
  });
});

const audio = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');

function updateMusicUI(){
  const muted = audio.paused || audio.muted || audio.volume === 0;
  musicBtn.classList.toggle('muted', muted);
  musicBtn.setAttribute('aria-pressed', String(!muted));
}
musicBtn.addEventListener('click', ()=>{
  if (audio.paused) {
    audio.play().then(updateMusicUI).catch(updateMusicUI);
  } else {
    audio.pause(); updateMusicUI();
  }
});
['play','pause','volumechange','ended'].forEach(ev => audio.addEventListener(ev, updateMusicUI));
updateMusicUI();

function startMusicSafely(){
  if(audio.paused) {
    audio.volume = 0;
    audio.play().then(() => {
        let vol = 0;
        const interval = setInterval(() => {
            vol += 0.1;
            if (vol >= 0.9) {
                audio.volume = 0.9;
                clearInterval(interval);
            } else {
                audio.volume = vol;
            }
        }, 80);
        updateMusicUI();
    }).catch(updateMusicUI);
  }
}

const finalText = `Этот день - твой. И я хотел сделать его особенным.
Пусть этот год принесёт тебе много радости, вдохновения и приятных моментов.
Желаю, чтобы рядом всегда были надёжные и тёплые люди, а каждый день открывал что то хорошее и новое.

Ты очень светлый и интересный человек, с тобой всегда легко и спокойно.
Спасибо, что умеешь поддержать, выслушать и просто быть рядом.
Твои глаза невероятно красивы. Они всегда поднимают настроение, а твоя доброта чувствуется сразу.

Ты из тех людей, которых хочется беречь и я благодарен за то, что ты есть в моей жизни

С 18‑летием, кошеня <3`;
const messageEl = document.getElementById('message');

function revealTextByLetters(el, text, baseDelay = 18, randomSpan = 22){
  el.innerHTML = '';
  const frag = document.createDocumentFragment();
  const trimmed = text.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n');
  let delay = 0;
  for (let i=0; i<trimmed.length; i++){
    const ch = trimmed[i];
    if (ch === '\n'){ frag.appendChild(document.createElement('br')); delay += 120; continue; }
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch;
    s.style.animationDelay = `${delay}ms`;
    frag.appendChild(s);
    delay += (ch === ' ' ? baseDelay/2 : baseDelay + Math.random()*randomSpan);
  }
  const heart = document.createElement('span');
  heart.className = 'heart-emoji'; heart.textContent = '❤️';
  heart.addEventListener('click', () => {
    document.getElementById('secretMessage')?.classList.add('shown');
    heart.style.pointerEvents = 'none';
    heart.style.cursor = 'default';
  }, {once: true});

  const wrap = document.createElement('span'); wrap.className = 'char';
  wrap.style.animationDelay = `${delay + 180}ms`; wrap.appendChild(heart);
  frag.appendChild(wrap);
  el.appendChild(frag);
  return delay + 600;
}

function startCelebration(){
  heartEngine.intensity = 1.0;
  heartEngine.burst(window.innerWidth/2, window.innerHeight/2, 28);
  document.querySelector('.title').style.opacity = '1';
  if (audio.paused) startMusicSafely();
  const totalMs = revealTextByLetters(messageEl, finalText, 18, 26);
  setTimeout(()=> heartEngine.burst(window.innerWidth/2, window.innerHeight/2, 30), Math.min(totalMs+400, 5000));
}

const coupons = [
  { title: 'Факт №1', text: 'Когда мы были на посадке, я почти не мог отвести от тебя взгляд. Ты выглядела очень красиво. Хотел подойти, но немного стеснялся. А потом вижу мы идём в одну сторону, как раз был красный свет на переходе. Подошёл познакомиться. И когда ты повернулась я аж немного завис. Ты оказалась ещё красивее вблизи💖' },
  { title: 'Факт №2', text: 'Как только мы начали проводить время вместе, парни из компании тут же заметили это и стали нас шипперить. Постоянно удивлялись и спрашивали типо встречаемся ли мы ахах' },
  { title: 'Факт №3', text: 'Твои объятия способны даже в трудный момент меня поддержать и поднять настроение💞' },
  { title: 'Факт №4', text: 'Когда мы сидели и я записывал телеграммы крупных артистов, после вопроса "А кто тебе нужен из них?" ты ответила "Ты" и в тот момент я понял что я обрёл своё счастье которое прямо сейчас находится рядом❣' },
  { title: 'Факт №5', text: 'Когда мы вместе, мне больше ничего не нужно. Ты - невероятно приятный и позитивный человек, с которым я всегда чувствую себя счастливым. Рядом с тобой я нахожу свой покой.' }
  ];

const huntArea = document.getElementById('huntArea');
const foundCountEl = document.getElementById('foundCount');
const toast = document.getElementById('toast');
const btnSpawnAgain = document.getElementById('spawnAgain');
const btnToGreeting = document.getElementById('toQuest2');
let redeemed = 0;
let heartsNodes = [];

function setupQuest1(){
  redeemed = 0;
  updateCounter();
  if (btnToGreeting) btnToGreeting.disabled = true;
  spawnHearts(5);
  showToast('Подсказка: ищи лёгкое покачивание 🌬️');
}

function updateCounter(){
  if (foundCountEl) foundCountEl.textContent = String(redeemed);
  if (btnToGreeting) btnToGreeting.disabled = redeemed < 5;
  if (redeemed >= 5) {
    showToast('Готово! Все секреты раскрыты 💗');
  }
}

function spawnHearts(n=5){
  heartsNodes.forEach(n => n.remove());
  heartsNodes = [];
  const bounds = huntArea.getBoundingClientRect();
  const cardRect = document.querySelector('#quest1 .quest-card').getBoundingClientRect();

  for(let i=0; i<n; i++){
    const heart = document.createElement('div');
    heart.className = 'hunt-heart';
    heart.style.setProperty('--r', Math.random().toFixed(2));
    let x, y, tries = 0;
    do{
      x = Math.random() * (bounds.width - 44) + 22;
      y = Math.random() * (bounds.height - 44) + 22;
      tries++;
    } while(
      (x > cardRect.left - bounds.left - 40 &&
       x < cardRect.right - bounds.left + 10 &&
       y > cardRect.top - bounds.top - 40 &&
       y < cardRect.bottom - bounds.top + 10) && tries < 120
    );

    heart.style.left = x + 'px'; heart.style.top  = y + 'px';

    heart.addEventListener('click', (e)=>{
      e.stopPropagation();
      
      if (redeemed >= 5 || heart.style.pointerEvents === 'none') return;
      
      heart.style.pointerEvents = 'none';
      
      const idx = redeemed;
      modal.show(coupons[idx].title, coupons[idx].text);
      
      const startRect = heart.getBoundingClientRect();
      animateHeartToCounter(startRect, () => {
        redeemed++;
        updateCounter();
      });

      heart.style.transform = 'translateY(-8px) rotate(-45deg) scale(0.1)';
      heart.style.opacity = '0';

    }, { once: false });

    huntArea.appendChild(heart); heartsNodes.push(heart);
  }
}

function showToast(text){
  if (!toast) return; toast.textContent = text; toast.classList.add('show');
  clearTimeout(showToast._t); showToast._t = setTimeout(()=> toast.classList.remove('show'), 2200);
}

if (btnSpawnAgain) btnSpawnAgain.addEventListener('click', (e)=>{ makeRipple(e); setupQuest1(); });
if (btnToGreeting) btnToGreeting.addEventListener('click', (e)=>{ makeRipple(e); showPanel('greeting'); });

const modal = (() => {
  const m = document.createElement('div'); m.className = 'modal';
  const card = document.createElement('div'); card.className = 'voucher';
  const h4 = document.createElement('h4'); const p = document.createElement('p');
  const btn = document.createElement('button'); btn.className = 'btn soft'; btn.textContent = 'Милота :)';
  card.append(h4, p, btn); m.append(card); document.body.appendChild(m);

  function hide() { m.classList.remove('show'); }
  btn.addEventListener('click', hide);
  m.addEventListener('click', (e) => { if(e.target === m) hide(); });

  return {
    show: (title, text) => { h4.textContent = title; p.textContent = text; m.classList.add('show'); }
  };
})();

function animateHeartToCounter(startRect, onDone){
  const pill = document.querySelector('#quest1 .pill');
  if (!pill) { onDone?.(); return; }

  const fly = document.createElement('div');
  fly.className = 'fly-heart';
  document.body.appendChild(fly);
  
  const sx = startRect.left + startRect.width/2;
  const sy = startRect.top  + startRect.height/2;
  fly.style.left = sx + 'px'; fly.style.top = sy + 'px';

  const pr = pill.getBoundingClientRect();
  const ex = pr.left + pr.width/2;
  const ey = pr.top  + pr.height/2;
  const dx = ex - sx, dy = ey - sy;

  const anim = fly.animate([
    { transform: 'translate(-50%,-50%) scale(1) rotate(-20deg)', offset: 0, opacity: 1 },
    { transform: `translate(calc(-50% + ${dx*0.7}px), calc(-50% + ${dy*0.7 - 80}px)) scale(.62) rotate(-30deg)`, offset: .6, opacity: 1 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.36) rotate(-45deg)`, offset: 1, opacity: .95 }
  ], { duration: 850, easing: 'cubic-bezier(.22,.61,.36,1)' });

  anim.onfinish = () => {
    fly.remove();
    const bg = document.createElement('div');
    bg.className = 'pill-heart';
    pill.appendChild(bg);
    bg.style.animation = 'pillHeartIn 900ms ease-out forwards';
    setTimeout(()=> bg.remove(), 1100);
    pill.classList.add('pop');
    setTimeout(()=> pill.classList.remove('pop'), 450);
    onDone?.();
  };
}

const canvas = document.getElementById('heartsCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
function resizeCanvas(){
  const { innerWidth:w, innerHeight:h } = window;
  canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR);
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
resizeCanvas(); window.addEventListener('resize', resizeCanvas);

const palette = ['#FF8FB7','#FFC8DD','#F3B1FF','#CDB4DB','#FDA4D4','#FFAFCC'];
const heartEngine = {
  particles: [], intensity: 0.35, lastSpawn: 0, spawnPerSecond: 12, maxParticles: 480,
  spawnFloating(){
    const w = window.innerWidth, h = window.innerHeight;
    const x = Math.random() * w, y = h + 20 + Math.random()*40;
    const size = 8 + Math.random()*18, rise = .25 + Math.random() * 0.9;
    const vx = (Math.random() - .5) * .6, rot = Math.random() * Math.PI;
    const color = palette[(Math.random()*palette.length)|0];
    this.particles.push({ x, y, vx, vy: -rise, rot, vr: (Math.random()-.5)*.02, size, color, life: 6 + Math.random()*6, age: 0, drift: (Math.random() * 0.6 + 0.2) * (Math.random()<.5? -1:1) });
  },
  burst(x, y, n=20){
    for(let i=0;i<n;i++){
      const angle = (Math.PI*2) * (i/n) + Math.random()*.4, speed = 1.2 + Math.random()*1.6;
      const size = 10 + Math.random()*16, color = palette[(Math.random()*palette.length)|0];
      this.particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, rot: Math.random()*Math.PI, vr: (Math.random()-.5)*.05, size, color, life: 2.6 + Math.random()*1.2, age: 0, drift: 0 });
    }
  },
  update(dt){
    const targetRate = this.spawnPerSecond * this.intensity;
    this.lastSpawn += dt; const spawnEvery = targetRate > 0 ? (1/targetRate) : Infinity;
    while(this.lastSpawn > spawnEvery && this.particles.length < this.maxParticles){ this.spawnFloating(); this.lastSpawn -= spawnEvery; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=this.particles.length-1; i>=0; i--){
      const p = this.particles[i]; p.age += dt; const t = p.age / p.life; if (t >= 1){ this.particles.splice(i,1); continue; }
      p.x += p.vx + Math.sin((p.age + p.rot)*0.8)*0.08 + p.drift*0.01; p.y += p.vy - Math.cos((p.age + p.rot)*0.3)*0.02;
      p.vx *= 0.995; p.vy *= 0.995; p.rot += p.vr*0.98;
      const alpha = Math.min(1, Math.max(0, 1 - (t*t))); drawHeart(p.x, p.y, p.size, p.rot, p.color, alpha);
    }
  }
};
function drawHeart(x, y, size, rot, color, alpha=1){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  const s = size;
  ctx.moveTo(0, -s*0.35);
  ctx.bezierCurveTo( s*0.5, -s*1.1,  s*1.2, -s*0.1,  0,  s*1.1);
  ctx.bezierCurveTo(-s*1.2, -s*0.1, -s*0.5, -s*1.1,  0, -s*0.35);
  ctx.closePath();
  const c = hexToRgb(color); ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`; ctx.fill(); ctx.restore();
}
function hexToRgb(hex){ const x = hex.replace('#',''); const bigint = parseInt(x.length===3 ? x.split('').map(h=>h+h).join('') : x, 16); return { r:(bigint>>16)&255, g:(bigint>>8)&255, b:bigint&255 }; }

let lastTime = performance.now();
function loop(now){ const dt = Math.min(0.05, (now - lastTime)/1000); lastTime = now; heartEngine.update(dt); requestAnimationFrame(loop); }
requestAnimationFrame(loop);

window.addEventListener('pointerdown', (e)=>{
  if (e.target.closest('.music, .btn, .hunt-heart, .modal, .closeMemories')) return;
  const rect = canvas.getBoundingClientRect();
  heartEngine.burst(e.clientX - rect.left, e.clientY - rect.top, 18 + (Math.random()*14|0));
});

function makeRipple(e){
  const btn = e.currentTarget; const rect = btn.getBoundingClientRect();
  const r = document.createElement('span'); r.className = 'ripple';
  r.style.left = ((e.clientX || rect.left + rect.width/2) - rect.left) + 'px';
  r.style.top  = ((e.clientY || rect.top  + rect.height/2) - rect.top ) + 'px';
  btn.appendChild(r); setTimeout(()=> r.remove(), 700);
}

const openMemoriesBtn = document.getElementById('openMemories');
const backToGreetingBtn = document.getElementById('backToGreeting');
if (openMemoriesBtn){
  openMemoriesBtn.addEventListener('click', makeRipple);
  openMemoriesBtn.addEventListener('click', ()=> showPanel('memories'));
}
if (backToGreetingBtn){
  backToGreetingBtn.addEventListener('click', (e)=>{ makeRipple(e); showPanel('greeting'); });
}
const closeMem = document.querySelector('.closeMemories');
if (closeMem) closeMem.addEventListener('click', ()=> showPanel('greeting'));
window.addEventListener('keydown', (e)=>{
  const mem = document.getElementById('memories');
  if (e.key === 'Escape' && mem && mem.classList.contains('active')) showPanel('greeting');
});


window.addEventListener('touchstart', ()=>{}, {passive:true});
