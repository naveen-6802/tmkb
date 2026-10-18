/* Keep essential setup independent of game startup. Canonicals are static in HTML. */
(function(){
 var open=document.getElementById('open-setup'),close=document.getElementById('close-setup'),panel=document.getElementById('setup-panel');
 if(open&&panel){
  open.onclick=function(){
   document.body.classList.add('setup-open');open.setAttribute('aria-expanded','true');
   // Opening the menu must not depend on focus options or smooth-scroll support.
   window.requestAnimationFrame(function(){try{panel.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){try{panel.scrollIntoView(false)}catch(ignore){}}});
  };
  if(close)close.onclick=function(){document.body.classList.remove('setup-open');open.setAttribute('aria-expanded','false');try{open.focus()}catch(e){}};
 }
 // Older Safari lacks native dialog methods. Apply this to existing and new dialogs.
 function supportDialog(dialog){
  if(typeof dialog.showModal==='function')return;
  dialog.classList.add('dialog-fallback');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
  dialog.showModal=function(){if(dialog.hasAttribute('open'))return;dialog._previousFocus=document.activeElement;dialog.setAttribute('open','');document.body.classList.add('fallback-modal-open');var first=dialog.querySelector('button,a[href],input,[tabindex]');if(first)first.focus()};
  dialog.close=function(){dialog.removeAttribute('open');if(!document.querySelector('dialog[open]'))document.body.classList.remove('fallback-modal-open');dialog.dispatchEvent(new Event('close'));if(dialog._previousFocus)try{dialog._previousFocus.focus()}catch(e){}};
 }
 var dialogs=document.querySelectorAll('dialog');for(var i=0;i<dialogs.length;i++)supportDialog(dialogs[i]);
 if(window.MutationObserver)new MutationObserver(function(records){records.forEach(function(record){for(var i=0;i<record.addedNodes.length;i++){var node=record.addedNodes[i];if(node.nodeType===1&&node.tagName==='DIALOG')supportDialog(node)}})}).observe(document.body,{childList:true});
 document.addEventListener('keydown',function(event){var dialog=document.querySelector('dialog.dialog-fallback[open]');if(!dialog)return;if(event.key==='Escape'){event.preventDefault();dialog.close()}if(event.key==='Tab'){var items=dialog.querySelectorAll('button:not([disabled]),a[href],input,[tabindex="0"]');if(!items.length)return;var first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
})();
