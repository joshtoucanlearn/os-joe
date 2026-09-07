"use client";
import {useEffect, useRef, useState} from 'react';

type Note = {id:string; title:string; body:string; colour:string; x:number; y:number; version:number};
const colours = [{name:'Lemon',value:'#f7e777'},{name:'Lime',value:'#c9eb87'},{name:'Orange',value:'#ffc28b'},{name:'Blue',value:'#acd7f6'},{name:'Pink',value:'#f8b7cf'}];
const API='https://joe-shared-wall.hotoffthepresspig.chatgpt.site/api/wall';
const blank = {title:'',body:'',colour:colours[0].value};
export default function StickyNotes(){
  const [notes,setNotes]=useState<Note[]>([]);
  const [draft,setDraft]=useState(blank);
  const [editing,setEditing]=useState<string|null>(null);
  const [status,setStatus]=useState('');
  const [code,setCode]=useState('');
  const [codeInput,setCodeInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [editingVersion,setEditingVersion]=useState<number|null>(null);
  const pending=useRef(false);
  const generation=useRef(0);
  const notesRef=useRef<Note[]>([]);
  const createId=useRef<string|null>(null);
  const moveTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const moveBase=useRef<{id:string;version:number}|null>(null);
  useEffect(()=>{notesRef.current=notes},[notes]);
  useEffect(()=>{try{const saved=sessionStorage.getItem('joe-wall-access');if(saved){setCodeInput(saved);void unlock(saved)}}catch{}},[]);
  async function call(method:string,payload?:unknown,key=code){
    const response=await fetch(API,{method,headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(15000)});
    const data=await response.json();
    if(!response.ok){if(response.status===409)moveBase.current=null;if(data.notes){setNotes(data.notes);notesRef.current=data.notes}throw new Error(data.error||'The wall could not save. Please try again.')}
    return data as {notes:Note[];note?:Note};
  }
  async function unlock(key:string){
    if(!key.trim()||pending.current)return;pending.current=true;setBusy(true);setStatus('Opening the shared wall…');
    try{const data=await call('GET',undefined,key.trim());setNotes(data.notes);notesRef.current=data.notes;setCode(key.trim());try{sessionStorage.setItem('joe-wall-access',key.trim())}catch{}setStatus('All notes are saved on the shared wall.')}catch(e){setStatus(e instanceof Error?e.message:'Could not open the wall. Try again.')}finally{pending.current=false;setBusy(false)}
  }
  useEffect(()=>{
    if(!code)return;
    let active=true;
    const refresh=async()=>{if(pending.current||drag.current||moveBase.current)return;const started=generation.current;try{const data=await call('GET');if(active&&started===generation.current&&!pending.current&&!drag.current&&!moveBase.current){setNotes(data.notes);notesRef.current=data.notes}}catch{if(active)setStatus('Connection lost. Your notes are still saved online. Reconnect before making changes.')}};
    const timer=setInterval(refresh,8000);window.addEventListener('focus',refresh);
    return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',refresh)};
  },[code]);
  async function save(method:string,payload:unknown){
    if(pending.current)return null;pending.current=true;generation.current++;setBusy(true);setStatus('Saving…');
    try{const data=await call(method,payload);setNotes(data.notes);notesRef.current=data.notes;setStatus('Saved. Everyone with the wall code can see this.');return data}catch(e){setStatus(e instanceof Error?e.message:'Not saved yet. Your words are still here; try again.');return null}finally{generation.current++;pending.current=false;setBusy(false)}
  }

  const [removed,setRemoved]=useState<Note|null>(null);
  const wall=useRef<HTMLDivElement>(null);
  const titleInput=useRef<HTMLInputElement>(null);
  const drag=useRef<{id:string;startX:number;startY:number;x:number;y:number}|null>(null);
  useEffect(()=>{const project=new URLSearchParams(location.search).get('project');if(project)setDraft({...blank,title:project})},[]);
  useEffect(()=>{
    const mc=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>void}}).modelContext;
    if(!mc)return;const controller=new AbortController();
    try{mc.registerTool({name:'read_joe_draft',description:'Read Joe’s current sticky note draft and wall without changing them.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:(input:unknown)=>{if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object');return code?{title:draft.title,body:draft.body,notes}:{locked:true}}},{signal:controller.signal})}catch{}
    return()=>controller.abort();
  },[draft,notes,code]);
  async function pin(){
    if(!draft.title.trim()&&!draft.body.trim())return;
    const existing=notesRef.current.find(n=>n.id===editing);
    if(editing&&!existing){setStatus('That note was removed on another device. Cancel the edit to write a new note.');return}
    const id=editing||(createId.current??=crypto.randomUUID());
    const result=await save(editing?'PATCH':'POST',{...draft,id,x:existing?.x??Math.min(65,(notes.length%3)*28+4),y:existing?.y??28+Math.floor(notes.length/3)*290,version:editingVersion});
    if(result){setDraft(blank);setEditing(null);setEditingVersion(null);createId.current=null;titleInput.current?.focus()}
  }
  function move(id:string,x:number,y:number){
    if(pending.current)return;
    const current=notesRef.current.find(n=>n.id===id);if(!current)return;
    moveBase.current??={id,version:current.version};
    const next=notesRef.current.map(n=>n.id===id?{...n,x:Math.max(0,Math.min(100,x)),y:Math.max(0,Math.min(50000,y))}:n);notesRef.current=next;setNotes(next);
  }
  async function finishMove(){
    if(moveTimer.current)clearTimeout(moveTimer.current);
    const base=moveBase.current;if(!base)return;
    const note=notesRef.current.find(n=>n.id===base.id);if(!note)return;
    const result=await save('PATCH',{id:note.id,version:base.version,action:'move',x:note.x,y:note.y});
    if(result){moveBase.current=null;setStatus('Position saved on the shared wall.');}
  }
  async function remove(note:Note){const data=await save('DELETE',{id:note.id,version:note.version});if(data?.note){setRemoved(data.note);if(editing===note.id){setEditing(null);setEditingVersion(null);setDraft(blank)}}}
  async function undo(){if(removed&&await save('PATCH',{id:removed.id,version:removed.version,action:'restore'}))setRemoved(null)}
  function lock(){if(pending.current||moveBase.current){setStatus('Finish saving your changes before closing the wall.');return}setCode('');setCodeInput('');setNotes([]);notesRef.current=[];try{sessionStorage.removeItem('joe-wall-access')}catch{}setStatus('Wall closed.');}
  function download(){const url=URL.createObjectURL(new Blob([notes.map(n=>n.title+'\n'+n.body).join('\n\n---\n\n')],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='joe-sticky-notes.txt';a.click();URL.revokeObjectURL(url)}
  if(!code)return <main className="joe-page"><span className="system-code">03 / MY IDEAS WALL</span><h1>Joe’s sticky notes</h1><form className="joe-panel wall-unlock" onSubmit={e=>{e.preventDefault();void unlock(codeInput)}}><h2>Open our shared wall</h2><p>Notes stay here for next time, on every device.</p><label htmlFor="wall-code">Wall code</label><input id="wall-code" type="password" autoComplete="current-password" value={codeInput} onChange={e=>setCodeInput(e.target.value)} required/><p>Use the code Joshua shared with you.</p><button className="game-button" disabled={busy} type="submit">{busy?'Opening…':'Open wall'}</button><p role="status">{status}</p></form></main>;
  return <main className="joe-page"><span className="system-code">03 / MY IDEAS WALL</span><div className="sticky-heading"><h1>Joe’s sticky notes</h1><div className="note-backup"><button disabled={busy} onClick={lock}>Close wall</button><button onClick={download} disabled={!notes.length}>Download my notes</button></div></div>
    <div className="sticky-layout"><form className="joe-panel note-composer" onSubmit={e=>{e.preventDefault();void pin()}}>
      <label htmlFor="note-title">Give it a name</label><input ref={titleInput} id="note-title" disabled={busy} maxLength={120} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="My next idea"/>
      <label htmlFor="note-body">Your note</label><textarea id="note-body" disabled={busy} maxLength={4000} value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder="My drink is… / I want to try…"/>
      <fieldset className="note-colours"><legend>Pick a colour</legend>{colours.map(c=><button key={c.name} disabled={busy} type="button" title={c.name} aria-label={c.name} aria-pressed={draft.colour===c.value} style={{background:c.value}} onClick={()=>setDraft({...draft,colour:c.value})}/>)}</fieldset>
      <button className="game-button" type="submit" disabled={busy||Boolean(moveBase.current)||(!draft.title.trim()&&!draft.body.trim())}>{editing?'Save changes':'Stick it on the wall'}</button>
      {editing&&<button className="ghost-button" disabled={busy} type="button" onClick={()=>{setEditing(null);setEditingVersion(null);setDraft(blank)}}>Cancel edit</button>}
      <p className="note-save-status" role="status">{status}</p>{moveBase.current&&!busy&&<button type="button" className="ghost-button" onClick={finishMove}>Retry saving position</button>}
      {removed&&<button className="ghost-button" type="button" disabled={busy} onClick={undo}>Undo remove</button>}
    </form><section aria-label="Joe’s sticky note wall"><p className="note-wall-caption">Drag the top of a note to move it. Or select its top and use the arrow keys.</p><div className="note-wall" ref={wall} style={{minHeight:Math.max(760,...notes.map(n=>n.y+450))}}>
      {!notes.length&&<div className="wall-empty"><h2>Your wall starts here.</h2><p>Write an idea and stick it up.</p></div>}
      {notes.map(note=><article className="sticky-note" key={note.id} style={{background:note.colour,left:`calc(${note.x}% - ${note.x/100} * var(--note-width, 220px))`,top:note.y}}>
        <button className="note-handle" aria-label={`Move ${note.title||'note'}`} disabled={busy} onPointerDown={e=>{if(pending.current)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:note.id,startX:e.clientX,startY:e.clientY,x:note.x,y:note.y}}} onPointerMove={e=>{const d=drag.current;if(!d||d.id!==note.id||!wall.current)return;const width=wall.current.clientWidth-e.currentTarget.parentElement!.clientWidth;move(note.id,d.x+(e.clientX-d.startX)/Math.max(1,width)*100,d.y+e.clientY-d.startY)}} onPointerUp={()=>{drag.current=null;void finishMove()}} onPointerCancel={()=>{drag.current=null;void finishMove()}} onKeyDown={e=>{const delta=e.shiftKey?10:3;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();move(note.id,note.x+(e.key==='ArrowRight'?delta:e.key==='ArrowLeft'?-delta:0),note.y+(e.key==='ArrowDown'?delta*4:e.key==='ArrowUp'?-delta*4:0));if(moveTimer.current)clearTimeout(moveTimer.current);moveTimer.current=setTimeout(()=>void finishMove(),400)}}}>⠿ Move</button>
        {note.title&&<h2>{note.title}</h2>}<p>{note.body}</p><div className="note-tools"><button disabled={busy||Boolean(moveBase.current)} onClick={()=>{setEditingVersion(note.version);setEditing(note.id);setDraft({title:note.title,body:note.body,colour:note.colour});titleInput.current?.focus()}}>Edit</button><button disabled={busy||Boolean(moveBase.current)} onClick={()=>void remove(note)}>Remove</button></div>
      </article>)}
    </div></section></div></main>
}
