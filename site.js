(()=>{
 const dialog=document.createElement('dialog');
 dialog.id='how-to-play';dialog.setAttribute('aria-labelledby','how-title');
 dialog.innerHTML=`<div class="guide-top"><div><span class="page-kicker">A QUICK GUIDE</span><h2 id="how-title">How to Play</h2></div><button class="guide-close" aria-label="Close How to Play">×</button></div><div class="guide-scroll"><p class="guide-lead">A good game starts with one move.</p><h3>1. Set up your game</h3><p>Choose <b>vs Computer</b> or <b>2 Players</b> on the same device. Pick your colour and, for computer games, your difficulty. White moves first. On mobile, tap <b>Play Now</b> to open these options.</p><h3>2. Make a move</h3><p>Tap or click a piece, then a highlighted destination. Take turns. Capture by landing on an opponent’s piece. You cannot leave your own king in check.</p><h3>3. Know your pieces</h3><div class="piece-guide"><div><b>♔ King</b><span>One square in any direction.</span></div><div><b>♕ Queen</b><span>Any distance in a straight or diagonal line.</span></div><div><b>♖ Rook</b><span>Any distance horizontally or vertically.</span></div><div><b>♗ Bishop</b><span>Any distance diagonally.</span></div><div><b>♘ Knight</b><span>An L shape: two squares, then one sideways. Can jump over pieces.</span></div><div><b>♙ Pawn</b><span>One square forward, or two on its first move if clear. Captures one square diagonally forward.</span></div></div><h3>4. Special moves</h3><p><b>Castling:</b> Move your king two squares toward a rook; the rook moves beside it. Both must be unmoved, the path clear, and the king cannot be in check or cross an attacked square.</p><p><b>Promotion:</b> A pawn reaching the far end becomes a queen, rook, bishop, or knight. Choose in the popup.</p><p><b>En passant:</b> Immediately after an opposing pawn advances two squares beside yours, your pawn may capture it diagonally as if it had advanced only one.</p><h3>5. Finish the game</h3><p><b>Checkmate</b> wins: the king is attacked and has no legal escape. <b>Stalemate</b> is a draw: there is no legal move, but the king is not in check. The game also recognises other drawn positions.</p><h3>Your board controls</h3><p><b>Undo</b> takes back a turn (Ctrl/Cmd + Z also works). <b>Hint</b> suggests a move. <b>Flip board</b> switches perspective in friend mode. <b>Fullscreen</b> expands the playing room. Sound can be switched off.</p><p>On mobile, swipe the bottom controls or use the arrow buttons. Open <b>Move history</b> to see previous moves.</p><div class="page-note">Your game saves in this browser when storage is available. Return home and choose <b>Resume</b> to continue.</div></div><div class="guide-bottom"><button class="guide-button" data-guide-done>Got it, let’s play</button></div>`;
 document.body.append(dialog);let opener=null;
 const close=()=>dialog.close();
 document.querySelectorAll('[data-how-to-play]').forEach(button=>button.addEventListener('click',()=>{opener=button;dialog.showModal();dialog.querySelector('.guide-scroll').scrollTop=0}));
 dialog.querySelector('.guide-close').addEventListener('click',close);dialog.querySelector('[data-guide-done]').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()}});
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 document.querySelectorAll('.site-footer a').forEach(link=>{if(location.pathname.endsWith('/'+link.getAttribute('href')))link.setAttribute('aria-current','page')});
})();

// A short mechanical UI tick, shared across game menus and information pages.
(()=>{
 let context,buffer;
 function enabled(){if(typeof sound!=='undefined')return sound;try{return localStorage.getItem('knightfall-sound')!=='off'}catch{return true}}
 function playClick(){
  if(!enabled())return;
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   context ||= new Audio();
   const tick=()=>{
    if(!enabled()||context.state!=='running')return;
    if(!buffer){const length=Math.ceil(context.sampleRate*.027);buffer=context.createBuffer(1,length,context.sampleRate);const data=buffer.getChannelData(0);let seed=73,last=0;for(let i=0;i<length;i++){seed=(seed*16807)%2147483647;const noise=seed/1073741823.5-1;const high=noise-last*.65;last=noise;data[i]=high*Math.exp(-i/(context.sampleRate*.0045))*Math.min(1,i/(context.sampleRate*.0004))}}
    const src=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
    src.buffer=buffer;filter.type='bandpass';filter.frequency.value=1900;filter.Q.value=.7;gain.gain.value=.22;
    src.connect(filter);filter.connect(gain);gain.connect(context.destination);src.start();src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect()};
   };
   if(context.state==='suspended')context.resume().then(tick).catch(()=>{});else tick();
  }catch{}
 }
 window.ChessroomUI={click:playClick};
 document.addEventListener('click',event=>{
  const target=event.target.closest('button');
  if(!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;
  if(!target.closest('#setup-panel,.game-controls,.game-topbar')&&target.id!=='open-setup')return;
  // These game controls already have their own deliberate audio feedback.
  if(['play','undo','flip','hint','sound','game-sound','result-again'].includes(target.id))return;
  playClick();
 },true);
})();
