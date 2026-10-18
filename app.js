function setControl(id,icon,label){$(id).innerHTML='<span class="material-symbols-rounded" aria-hidden="true">'+icon+'</span><span class="button-label">'+label+'</span>'}
const $=id=>document.getElementById(id);let game=new Chess(),selected=-1,legal=[],flipped=false,mode='computer',busy=false,sound=true,timer,epoch=0,hintSquare=-1;
let playing=false,playerColor='w',resultKey='',resultTimer;
const shapes={p:'<circle cx="50" cy="30" r="13"/><path d="M42 44 Q45 61 34 73 L66 73 Q55 61 58 44Z"/><ellipse cx="50" cy="76" rx="22" ry="7"/>',r:'<path d="M29 20H39V29H46V20H55V29H62V20H72V39L63 46L66 72H34L37 46L29 39Z"/><path d="M35 48H65"/>',b:'<path d="M50 12 Q78 35 63 45 Q57 50 59 58L66 73H34L41 58Q43 50 36 44Q23 33 50 12Z"/><path d="M55 24L45 38"/>',n:'<path d="M32 73 Q35 60 45 49 L31 53 Q25 53 22 46 L20 41 L36 25 L39 13 L49 22 Q62 19 71 31 Q81 44 73 59 L69 73Z"/><path d="M43 28 L32 39 L25 42" fill="none" stroke-width="2"/><path d="M57 29 Q70 43 57 61 L51 72" fill="none" stroke-width="2" opacity=".65"/><path d="M41 16 L44 27" fill="none" stroke-width="2"/><circle cx="47" cy="33" r="2.5" fill="#263d34" stroke="none"/><path d="M24 47 L31 46" fill="none" stroke-width="2"/>',q:'<path d="M28 28L40 41L50 23L60 41L72 28L63 54L66 73H34L37 54Z"/><circle cx="28" cy="24" r="5"/><circle cx="50" cy="19" r="5"/><circle cx="72" cy="24" r="5"/><path d="M37 54H63"/>',k:'<path d="M45 10H55V19H63V27H55V36H45V27H37V19H45Z"/><path d="M34 39Q50 32 66 39L61 53L66 73H34L39 53Z"/><path d="M39 53H61"/>'};
let pieceId=0;
function piece(p){let white=side(p)==='w',id='piece-gradient-'+(++pieceId);return `<svg class="piece" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop stop-color="${white?'#d7dfc5':'#102d2e'}"/><stop offset=".38" stop-color="${white?'#fffdec':'#4c6d68'}"/><stop offset=".65" stop-color="${white?'#eef2da':'#274c49'}"/><stop offset="1" stop-color="${white?'#b1bea0':'#112d2c'}"/></linearGradient></defs><g class="piece-art"><ellipse cx="52" cy="87" rx="29" ry="6" fill="#20382a" opacity=".15"/><g fill="url(#${id})" stroke="${white?'#9baa88':'#153b37'}" stroke-width="1.3" stroke-linejoin="round">${shapes[p.toLowerCase()]}<path d="M31 73Q50 68 69 73L74 83Q50 94 26 83Z"/><ellipse cx="50" cy="74" rx="19" ry="4" fill="none" opacity=".5"/><path d="M28 81Q50 90 72 81" fill="none" opacity=".5"/></g></g></svg>`}
const names={p:'pawn',r:'rook',n:'knight',b:'bishop',q:'queen',k:'king'},sq=i=>'abcdefgh'[i%8]+(8-(i>>3));
function save(){try{localStorage.setItem('chessroom-classic-v1',JSON.stringify({state:game.snapshot(),history:game.history,positions:game.positions,mode,flipped,playerColor,level:$('level').value}))}catch{}}
try{let x=JSON.parse(localStorage.getItem('chessroom-classic-v1'));if(x){game.restore(x.state);game.history=x.history;game.positions=x.positions||[];mode=x.mode;playerColor=x.playerColor==='b'?'b':'w';flipped=x.flipped;$('level').value=x.level}}catch{}
function render(){if(mode==='computer')flipped=playerColor==='b';
 document.body.classList.toggle('shared-turn-view',mode==='local');
 document.body.classList.toggle('turn-facing-away',mode==='local'&&game.turn!==(flipped?'b':'w'));
 legal=game.moves();let st=game.status(),last=game.history.at(-1)?.move;let html='';for(let n=0;n<64;n++){let i=flipped?63-n:n,p=game.b[i],target=legal.some(m=>m.f===selected&&m.t===i);html+=`<button class="sq ${( (i>>3)+i%8)%2?'shade':''} ${i===selected?'selected':''} ${last&&(i===last.f||i===last.t)?'last':''} ${i===hintSquare?'hint':''} ${st==='check'&&p===(game.turn==='w'?'K':'k')?'check':''}" data-i="${i}" role="gridcell" aria-label="${sq(i)}${p!=='.'?' '+(side(p)==='w'?'white ':'black ')+names[p.toLowerCase()]:''}${target?', legal destination':''}" aria-selected="${i===selected}">${p!=='.'?piece(p):''}${target?`<span class="dot ${p!=='.'?'capture':''}"></span>`:''}${n>=56?`<span class="coord">${sq(i)[0]}</span>`:''}${n%8===0?`<span class="coord rank">${sq(i)[1]}</span>`:''}</button>`}$('board').innerHTML=html;let who=game.turn==='w'?'White':'Black';$('status').textContent=st==='checkmate'?`${who==='White'?'Black':'White'} wins`:st==='stalemate'?'Stalemate':st==='draw'?'A well-played draw':busy?'Chessroom is thinking…':`${who} to move${st==='check'?' · check':''}`;$('message').textContent=st==='checkmate'?'Checkmate. A good moment for another game.':st==='draw'||st==='stalemate'?'The game is drawn. Try a new opening?':st==='check'?'Your king needs a little attention.':busy?'Finding a little possibility on the board.':selected<0?'Select a piece. Find your next possibility.':'Highlighted squares show your legal moves.';$('blacklight').classList.toggle('on',game.turn==='b');$('whitelight').classList.toggle('on',game.turn==='w');$('opponent').textContent=mode==='computer'?'chessroom':'Player two';$('opdetail').textContent=mode==='computer'?'A friendly challenge':'Same board. Good company.';$('you').textContent=mode==='computer'?'You':'Player one';$('computer').classList.toggle('selected',mode==='computer');$('local').classList.toggle('selected',mode==='local');$('levelwrap').style.display=mode==='computer'?'block':'none';$('levelname').textContent=['Easy','Medium','Hard'][$('level').value-1];$('count').textContent=Math.ceil(game.history.length/2)+' MOVES';if(game.history.length){let html='';for(let i=0;i<game.history.length;i+=2)html+=`<div class="move-row"><span>${i/2+1}.</span><span>${notation(game.history[i])}</span><span>${game.history[i+1]?notation(game.history[i+1]):'-'}</span></div>`;$('moves').innerHTML=html;$('moves').scrollTop=$('moves').scrollHeight}else $('moves').innerHTML='<div class="empty"><span>↗</span><b>A fresh perspective.</b><p>Select a piece to see where it can go.</p></div>';syncDifficulty();syncPlayerColors();save();syncResult(st)}
function notation(h){let m=h.move;return m.castle?(m.t>m.f?'O-O':'O-O-O'):(h.piece.toLowerCase()==='p'?'':h.piece.toUpperCase())+sq(m.f)+(h.capture?'×':'–')+sq(m.t)+(m.p?'='+m.p.toUpperCase():'')}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2400)}
let audioContext;
async function unlockAudio(){
  if(!sound)return null;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('unsupported');audioContext ||= new Audio();if(audioContext.state==='suspended')await audioContext.resume();return audioContext}
  catch{toast('Audio is unavailable. Check your browser sound permissions.');return null}
}
let woodenTapBuffer;
function woodenTap(c,{pitch=1,volume=.45,delay=0}={}){
 if(!woodenTapBuffer){
  const rate=c.sampleRate,length=Math.ceil(rate*.115);woodenTapBuffer=c.createBuffer(1,length,rate);const data=woodenTapBuffer.getChannelData(0);
  let low=0,body=0,seed=9173;
  for(let i=0;i<length;i++){
   const t=i/rate;seed=(seed*16807)%2147483647;const noise=seed/1073741823.5-1;
   low+=.28*(noise-low);body+=.045*(noise-body);
   const attack=Math.min(1,t/.0007);
   // A firm contact followed by the short, low resonance of a wooden board.
   const contact=(low-body)*1.1*Math.exp(-t*210);
   const wood=.48*Math.sin(2*Math.PI*185*t)*Math.exp(-t*63)
             +.23*Math.sin(2*Math.PI*420*t)*Math.exp(-t*88)
             +.12*Math.sin(2*Math.PI*860*t)*Math.exp(-t*145);
   data[i]=attack*(contact+wood+body*.2*Math.exp(-t*90));
  }
 }
 const src=c.createBufferSource(),gain=c.createGain();src.buffer=woodenTapBuffer;src.playbackRate.value=pitch;gain.gain.value=volume;src.connect(gain);gain.connect(c.destination);src.start(c.currentTime+delay);
 src.onended=()=>{src.disconnect();gain.disconnect()};
}
async function tone(kind='move'){
  const c=await unlockAudio();if(!c||c.state!=='running')return;
  if(['flip','hint','undo'].includes(kind)){window.ChessroomUI?.click();return}
  if(['move','capture','check'].includes(kind)){
   const capture=kind==='capture';
   woodenTap(c,{pitch:capture?.88:1,volume:capture?.66:.56});
   if(capture)woodenTap(c,{pitch:1.12,volume:.28,delay:.055});
   return;
  }
  const notes=kind==='win'?[392,523,659,784,1047]:kind==='end'?[392,330,262]:kind==='start'?[392,523,659,784]:kind==='check'?[523,659,784]:kind==='capture'?[220,140]:[540,320];
  notes.forEach((frequency,i)=>{let o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.055;o.type='triangle';o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(frequency*.55,t+.12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.19);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.2)})
}
document.addEventListener('pointerdown',()=>{void unlockAudio()},{passive:true});
document.addEventListener('keydown',()=>{void unlockAudio()});
function animateMove(m){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const to=$('board').querySelector(`[data-i="${m.t}"] .piece`),from=$('board').querySelector(`[data-i="${m.f}"]`),dest=$('board').querySelector(`[data-i="${m.t}"]`);
  if(!to||!from)return;
  const a=from.getBoundingClientRect(),b=dest.getBoundingClientRect(),r=to.getBoundingClientRect();
  const ghost=to.cloneNode(true);ghost.classList.add('moving-piece');Object.assign(ghost.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',zIndex:50,pointerEvents:'none'});document.body.append(ghost);to.style.opacity='0';
  const animation=ghost.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px) scale(1)`},{transform:`translate(${(a.left-b.left)*.45}px,${(a.top-b.top)*.45-15}px) scale(1.08)`,offset:.5},{transform:'translate(0,0) scale(1)'}],{duration:320,easing:'cubic-bezier(.2,.7,.3,1)'});
  const clean=()=>{ghost.remove();to.style.opacity='';};animation.onfinish=clean;animation.oncancel=clean;
  dest.classList.add('landed');setTimeout(()=>dest.classList.remove('landed'),650);
}
function moveSound(){let h=game.history.at(-1);tone(game.check()?'check':h?.capture?'capture':'move')}
function commit(m){game.move(m);selected=-1;hintSquare=-1;moveSound();render();computer();animateMove(m)}
$('board').onclick=e=>{void unlockAudio();let el=e.target.closest('[data-i]');if(!playing||!el||busy||(mode==='computer'&&game.turn!==playerColor)||!['playing','check'].includes(game.status()))return;let i=+el.dataset.i,candidates=legal.filter(m=>m.f===selected&&m.t===i);if(candidates.length){if(candidates[0].p){$('choices').innerHTML=candidates.map((m,k)=>`<button data-k="${k}" aria-label="Promote to ${names[m.p]}">${piece(game.turn==='w'?m.p.toUpperCase():m.p)}</button>`).join('');$('choices').onclick=e=>{let b=e.target.closest('[data-k]');if(b){$('promotion').close();commit(candidates[+b.dataset.k])}};$('promotion').showModal()}else commit(candidates[0]);return}selected=side(game.b[i])===game.turn?(i===selected?-1:i):-1;render()};
const vals={p:100,n:310,b:330,r:500,q:900,k:0};function evaluate(){let v=0;for(let i=0;i<64;i++){let p=game.b[i];if(p==='.')continue;let s=side(p),r=i>>3,c=i%8,center=3.5-Math.abs(c-3.5)+3.5-Math.abs(r-3.5);let bonus=p.toLowerCase()==='p'?(s==='w'?6-r:r-1)*7:center*4;v+=(s===game.turn?1:-1)*(vals[p.toLowerCase()]+bonus)}return v}
function search(depth,a,b){let moves=game.moves();if(!moves.length)return game.check()?-100000-depth:0;if(depth===0)return evaluate();moves.sort((x,y)=>(vals[game.b[y.t].toLowerCase()]||0)-(vals[game.b[x.t].toLowerCase()]||0));let best=-Infinity;for(let m of moves){let s=game.snapshot();game.apply(m);let v=-search(depth-1,-b,-a);game.restore(s);best=Math.max(best,v);a=Math.max(a,v);if(a>=b)break}return best}
function bestMove(depth){let moves=game.moves(),best=-Infinity,chosen=moves[0];for(let m of moves){let s=game.snapshot();game.apply(m);let v=-search(depth-1,-Infinity,Infinity)+Math.random()*($('level').value==='1'?100:6);game.restore(s);if(v>best){best=v;chosen=m}}return chosen}
function computer(){if(!playing||mode!=='computer'||game.turn===playerColor||!['playing','check'].includes(game.status()))return;busy=true;render();let token=epoch;timer=setTimeout(()=>{if(token!==epoch)return;let m=bestMove(+$('level').value);busy=false;if(m){game.move(m);moveSound()}render();if(m)animateMove(m)},350)}
$('undo').onclick=()=>{
 if(mode==='computer'&&!game.history.some(h=>side(h.piece)===playerColor)){toast('Make your first move to use undo.');return}
 if(!game.history.length)return;
 epoch++;clearTimeout(timer);busy=false;game.undo();
 if(mode==='computer'&&game.turn!==playerColor)game.undo();
 selected=-1;hintSquare=-1;render();void tone('undo')
};let boardFlipping=false;
$('flip').onclick=async()=>{
 if(mode==='computer'||boardFlipping)return;
 const frame=document.querySelector('.board-frame');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!frame.animate){flipped=!flipped;render();void tone('flip');return}
 boardFlipping=true;document.body.classList.add('board-flipping');$('flip').disabled=true;
 const token=epoch,base=getComputedStyle(frame).transform;
 const tilt=base==='none'?'':base;
 const options={duration:700,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'};
 const turn=frame.animate([{transform:tilt+' rotateZ(0deg)'},{transform:tilt+' rotateZ(180deg)'}],options);
 const counters=[...frame.querySelectorAll('.piece,.coord')].map(el=>el.animate([{transform:'rotate(0deg)'},{transform:'rotate(-180deg)'}],options));
 void tone('flip');
 try{await turn.finished;if(epoch===token&&mode==='local'){flipped=!flipped;render()}}
 catch{}
 finally{turn.cancel();counters.forEach(a=>a.cancel());boardFlipping=false;document.body.classList.remove('board-flipping');syncPlayerColors()}
};function soundUI(){setControl('sound',sound?'volume_up':'volume_off',sound?'Sound on':'Sound off');$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Mute sound':'Enable sound')}
try{sound=localStorage.getItem('knightfall-sound')!=='off'}catch{}soundUI();
$('sound').onclick=async()=>{sound=!sound;soundUI();try{localStorage.setItem('knightfall-sound',sound?'on':'off')}catch{}if(sound){await unlockAudio();window.ChessroomUI?.click()}};
document.body.classList.add('dark-mode');
$('hint').onclick=()=>{if(busy||!['playing','check'].includes(game.status()))return;let m=bestMove(2);if(m){selected=m.f;hintSquare=m.t;render();void tone('hint');toast(`Try ${sq(m.f)} → ${sq(m.t)}`)}};$('level').oninput=render;
let pendingMode=null,pendingColor=null;function requestNew(m=null){pendingMode=m;if(game.history.length)$('confirm').showModal();else reset()}function reset(){epoch++;clearTimeout(timer);busy=false;game=new Chess();selected=-1;hintSquare=-1;if(pendingMode)mode=pendingMode;pendingMode=null;if(pendingColor)playerColor=pendingColor;pendingColor=null;flipped=playerColor==='b';render();updateLobby()}$('new').onclick=()=>requestNew();$('computer').onclick=()=>{if(mode!=='computer')requestNew('computer')};$('local').onclick=()=>{if(mode!=='local')requestNew('local')};$('cancel').onclick=()=>{$('confirm').close();pendingMode=null;pendingColor=null};$('restart').onclick=()=>{$('confirm').close();reset()};render();updateLobby();

function updateLobby(){
  const resumable=game.history.length>0&&['playing','check'].includes(game.status());
  setControl('play','play_arrow',resumable?'Resume':'Play');
  setControl('open-setup','play_arrow',resumable?'Resume':'Play Now');
  $('play').setAttribute('aria-label',resumable?'Resume playing':'Play chess');
  $('new').hidden=!game.history.length;
}
function showScreen(active){
  playing=active;
  document.body.classList.toggle('in-menu',!active);
  document.body.classList.toggle('in-game',active);
  $('lobby').hidden=active;$('game-screen').hidden=!active;
  if(!active){document.body.classList.remove('setup-open');$('open-setup').setAttribute('aria-expanded','false');epoch++;clearTimeout(timer);busy=false;selected=-1;render();updateLobby()}
  window.scrollTo({top:0,behavior:'instant'});
}
function renderHomeBoard(){
 const board=initial();let html='<div class="demo-squares">';
 for(let i=0;i<64;i++)html+=`<span class="demo-square ${((i>>3)+i%8)%2?'shade':''}"></span>`;
 html+='</div><div class="demo-pieces">';
 const moves={52:'demo-white-pawn',12:'demo-black-pawn',62:'demo-white-knight',1:'demo-black-knight'};
 for(let i=0;i<64;i++)if(board[i]!=='.')html+=`<div class="demo-piece ${side(board[i])==='w'?'demo-white':'demo-black'} ${moves[i]||''}" style="left:${i%8*12.5}%;top:${(i>>3)*12.5}%">${piece(board[i])}</div>`;
 $('home-board').innerHTML=html+'</div>';
}
renderHomeBoard();
$('play').onclick=()=>{void tone('start');showScreen(true);render();computer();$('menu').focus()};
$('menu').onclick=()=>{showScreen(false);$('play').focus()};
$('history-toggle').onclick=()=>{let open=document.body.classList.toggle('show-history');$('history-toggle').setAttribute('aria-expanded',String(open));setControl('history-toggle','history',open?'Hide history':'Move history')};

const fullButton=$('fullscreen');
function fullscreenUI(){const active=Boolean(document.fullscreenElement)||document.body.classList.contains('focus-mode');setControl('fullscreen',active?'fullscreen_exit':'fullscreen',active?'Exit fullscreen':'Fullscreen');fullButton.setAttribute('aria-pressed',String(active))}
async function toggleFullscreen(){
 try{
   if(document.fullscreenElement){await document.exitFullscreen()}
   else if(document.body.classList.contains('focus-mode')){document.body.classList.remove('focus-mode')}
   else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen()}
   else{document.body.classList.add('focus-mode');toast('Expanded view enabled')}
 }catch{document.body.classList.toggle('focus-mode');toast('Expanded view enabled. Fullscreen is restricted by this browser.')}
 fullscreenUI();
}
fullButton.onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',fullscreenUI);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('focus-mode');fullscreenUI()}});
const openMenu=$('menu').onclick;
$('menu').onclick=()=>{document.body.classList.remove('focus-mode');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});openMenu();fullscreenUI()};

// Use the same undo action for the button and keyboard shortcut.
document.addEventListener('keydown',e=>{
  if(!playing||e.defaultPrevented||e.repeat||e.altKey||e.shiftKey||!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='z')return;
  const target=e.target;
  if(target?.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName||'')||document.querySelector('dialog[open]'))return;
  e.preventDefault();$('undo').click();
});
function syncGamePreferences(){
 setControl('game-sound',sound?'volume_up':'volume_off',sound?'Sound on':'Sound off');
 $('game-sound').setAttribute('aria-pressed',String(sound));
}
$('game-sound').onclick=async()=>{await $('sound').onclick();syncGamePreferences()};
$('play').addEventListener('click',syncGamePreferences);
syncGamePreferences();

function syncPlayerColors(){
 if(mode==='computer')flipped=playerColor==='b';
 $('flip').disabled=mode==='computer';
 $('flip').setAttribute('aria-disabled',String(mode==='computer'));
 $('flip').title=mode==='computer'?'Board stays on your chosen color against the computer':'Flip the board';
 const top=flipped?'w':'b',bottom=top==='w'?'b':'w';
 function playerName(color){return color===playerColor?(mode==='computer'?'You':'Player one'):(mode==='computer'?'chessroom':'Player two')}
 $('opponent').textContent=playerName(top);$('you').textContent=playerName(bottom);
 $('opdetail').textContent=top===playerColor?'Your chosen pieces':mode==='computer'?'A friendly challenge':'Same board. Good company.';
 $('top-color').textContent=top==='w'?'WHITE':'BLACK';$('bottom-color').textContent=bottom==='w'?'WHITE':'BLACK';
 for(const [id,color] of [['top-avatar',top],['bottom-avatar',bottom]]){const el=$(id);el.className='avatar '+(color==='w'?'light':'dark');el.textContent=color==='w'?'♘':'♞'}
 $('blacklight').classList.toggle('on',game.turn===top);$('whitelight').classList.toggle('on',game.turn===bottom);
 $('choose-white').classList.toggle('selected',playerColor==='w');$('choose-black').classList.toggle('selected',playerColor==='b');
 $('choose-white').setAttribute('aria-pressed',String(playerColor==='w'));$('choose-black').setAttribute('aria-pressed',String(playerColor==='b'));
 $('color-label').textContent=mode==='computer'?'Your pieces':'Player one’s pieces';
}
function chooseColor(color){
 if(color===playerColor)return;
 pendingColor=color;
 if(game.history.length){$('confirm').showModal()}else reset();
}
$('choose-white').onclick=()=>chooseColor('w');$('choose-black').onclick=()=>chooseColor('b');

function syncResult(status){
 const terminal=['checkmate','stalemate','draw'].includes(status);
 if(!terminal){resultKey='';clearTimeout(resultTimer);document.body.classList.remove('game-finished');if($('result-dialog').open)$('result-dialog').close();return}
 if(!playing)return;
 const key=game.b.join('')+game.turn+status;
 if(resultKey===key)return;
 resultKey=key;document.body.classList.add('game-finished');
 const winner=game.turn==='w'?'b':'w';
 const victory=status==='checkmate'&&(mode==='local'||winner===playerColor);
 const color=winner==='w'?'White':'Black';
 const name=mode==='computer'?(winner===playerColor?'You':'chessroom'):(winner===playerColor?'Player one':'Player two');
 const title=status!=='checkmate'?'A well-played draw':mode==='computer'?(victory?'You win!':'Computer wins'):name+' wins!';
 $('result-title').textContent=title;
 $('result-label').textContent=status==='checkmate'?'CHECKMATE':status==='stalemate'?'STALEMATE':'DRAW';
 $('result-symbol').textContent=status!=='checkmate'?'½':victory?'♛':'♚';
 $('result-description').textContent=status==='checkmate'?`${name} ${name==='You'?'win':'wins'} with ${color.toLowerCase()}. `+(victory?'A great finish. Enjoy the moment.':'A good challenge. Your next game is a fresh start.'):status==='stalemate'?'No legal moves, but the king is safe. The game is drawn.':'Neither side takes the win. Ready for another round?';
 $('result-score').textContent=status!=='checkmate'?'½ : ½':winner==='w'?'1 : 0':'0 : 1';
 $('result-dialog').classList.toggle('victory',victory);
 $('result-confetti').innerHTML=victory?Array.from({length:36},(_,i)=>`<i style="--x:${(i*37)%100}%;--delay:${(i%9)*.09}s;--drift:${(i%2?1:-1)*(30+i%6*12)}px;--spin:${(i%2?1:-1)*(180+i*19)}deg"></i>`).join(''):'';
 const token=epoch;
 clearTimeout(resultTimer);resultTimer=setTimeout(()=>{
  if(!playing||epoch!==token||resultKey!==key)return;
  if(!$('result-dialog').open)$('result-dialog').showModal();
  tone(victory?'win':'end');
 },500);
}
$('result-board').onclick=()=>{$('result-dialog').close();$('undo').focus()};
$('result-again').onclick=()=>{$('result-dialog').close();reset();computer()};
$('result-menu').onclick=()=>{$('result-dialog').close();$('menu').onclick()};

function syncDifficulty(){
 for(const [id,value] of [['difficulty-easy','1'],['difficulty-medium','2'],['difficulty-hard','3']]){
  const active=$('level').value===value;$(id).classList.toggle('selected',active);$(id).setAttribute('aria-pressed',String(active));
 }
}
for(const [id,value] of [['difficulty-easy','1'],['difficulty-medium','2'],['difficulty-hard','3']])$(id).onclick=()=>{$('level').value=value;render()};

// Move the same controls, retaining their handlers, into a phone toolbar.
const phoneLayout=matchMedia('(max-width: 700px)');
function arrangePlayControls(){
 const toolbar=document.querySelector('.game-topbar');
 const card=document.querySelector('.control-card');
 const screen=$('game-screen');
 if(!toolbar||!card||!screen)return;
 const history=$('history-panel'),aside=document.querySelector('.game-controls');
 const live=document.querySelector('.game-live');
 const tools=document.querySelector('.board-tools');
 if(phoneLayout.matches){
  $('undo').classList.add('menu-button');
  toolbar.insertBefore($('undo'),$('fullscreen'));
  if(live)screen.insertBefore(live,screen.firstChild);
  card.insertBefore(toolbar,card.firstChild);
  if(history&&aside)aside.appendChild(history);
 }else{
  $('undo').classList.remove('menu-button');
  tools.insertBefore($('undo'),tools.firstChild);
  if(live)toolbar.insertBefore(live,toolbar.firstChild);
  card.insertBefore(toolbar,card.firstChild);
  if(history)card.appendChild(history);
 }
}
arrangePlayControls();
phoneLayout.addEventListener?.('change',arrangePlayControls);

const controlsStrip=document.querySelector('#mobile-controls-strip');
if(controlsStrip){
 const left=$('controls-left'),right=$('controls-right');
 function syncControlArrows(){
  const end=Math.max(0,controlsStrip.scrollWidth-controlsStrip.clientWidth);
  left.disabled=controlsStrip.scrollLeft<=2;
  right.disabled=controlsStrip.scrollLeft>=end-2;
 }
 function scrollControls(direction){
  const distance=Math.max(115,controlsStrip.clientWidth*.75);
  controlsStrip.scrollBy({left:direction*distance,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
 left.onclick=()=>scrollControls(-1);right.onclick=()=>scrollControls(1);
 controlsStrip.addEventListener('scroll',syncControlArrows,{passive:true});
 window.addEventListener('resize',syncControlArrows,{passive:true});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(syncControlArrows).observe(controlsStrip);
 $('play').addEventListener('click',()=>requestAnimationFrame(syncControlArrows));
 document.addEventListener('fullscreenchange',()=>requestAnimationFrame(syncControlArrows));
 syncControlArrows();
}

$('open-setup').onclick=()=>{
 document.body.classList.add('setup-open');$('open-setup').setAttribute('aria-expanded','true');
 $('computer').focus({preventScroll:true});
 $('setup-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
};
$('close-setup').onclick=()=>{
 document.body.classList.remove('setup-open');$('open-setup').setAttribute('aria-expanded','false');$('open-setup').focus();
};

$('menu').addEventListener('click',()=>document.body.classList.remove('show-history'));
