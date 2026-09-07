"use client";
import {useEffect, useRef, useState} from 'react';

type Note = {id:string; title:string; body:string; colour:string; x:number; y:number};
const colours = [{name:'Lemon',value:'#f7e777'},{name:'Lime',value:'#c9eb87'},{name:'Orange',value:'#ffc28b'},{name:'Blue',value:'#acd7f6'},{name:'Pink',value:'#f8b7cf'}];
const blank = {title:'',body:'',colour:colours[0].value};
export default function StickyNotes(){
  const [notes,setNotes]=useState<Note[]>([]);
  const [draft,setDraft]=useState(blank);
  const [editing,setEditing]=useState<string|null>(null);
  const [status,setStatus]=useState('Preview only — saving is not connected yet.');
  const [removed,setRemoved]=useState<Note|null>(null);
  const wall=useRef<HTMLDivElement>(null);
  const titleInput=useRef<HTMLInputElement>(null);
  const drag=useRef<{id:string;startX:number;startY:number;x:number;y:number}|null>(null);
  useEffect(()=>{const project=new URLSearchParams(location.search).get('project');if(project)setDraft({...blank,title:project})},[]);
  useEffect(()=>{
    const mc=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>void}}).modelContext;
    if(!mc)return;const controller=new AbortController();
    try{mc.registerTool({name:'read_joe_draft',description:'Read Joe’s current sticky note draft and wall without changing them.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:(input:unknown)=>{if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object');return {title:draft.title,body:draft.body,notes}}},{signal:controller.signal})}catch{}
    return()=>controller.abort();
  },[draft,notes]);
  function pin(){
    if(!draft.title.trim()&&!draft.body.trim())return;
    if(editing)setNotes(all=>all.map(n=>n.id===editing?{...n,...draft}:n));
    else setNotes(all=>[...all,{...draft,id:crypto.randomUUID(),x:Math.min(65,(all.length%3)*28+4),y:28+Math.floor(all.length/3)*290}]);
    setDraft(blank);setEditing(null);titleInput.current?.focus();
  }
  function move(id:string,x:number,y:number){setNotes(all=>all.map(n=>n.id===id?{...n,x:Math.max(0,Math.min(100,x)),y:Math.max(0,y)}:n))}
  function download(){const url=URL.createObjectURL(new Blob([notes.map(n=>n.title+'\n'+n.body).join('\n\n---\n\n')],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='joe-sticky-notes.txt';a.click();URL.revokeObjectURL(url)}
  return <main className="joe-page"><span className="system-code">03 / MY IDEAS WALL</span><div className="sticky-heading"><h1>Joe’s sticky notes</h1><div className="note-backup"><button onClick={download} disabled={!notes.length}>Download my notes</button></div></div>
    <div className="sticky-layout"><form className="joe-panel note-composer" onSubmit={e=>{e.preventDefault();pin()}}>
      <label htmlFor="note-title">Give it a name</label><input ref={titleInput} id="note-title" maxLength={120} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="My next idea"/>
      <label htmlFor="note-body">Your note</label><textarea id="note-body" value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder="My drink is… / I want to try…"/>
      <fieldset className="note-colours"><legend>Pick a colour</legend>{colours.map(c=><button key={c.name} type="button" title={c.name} aria-label={c.name} aria-pressed={draft.colour===c.value} style={{background:c.value}} onClick={()=>setDraft({...draft,colour:c.value})}/>)}</fieldset>
      <button className="game-button" type="submit" disabled={!draft.title.trim()&&!draft.body.trim()}>{editing?'Save changes':'Stick it on the wall'}</button>
      {editing&&<button className="ghost-button" type="button" onClick={()=>{setEditing(null);setDraft(blank)}}>Cancel edit</button>}
      <p className="note-save-status" role="status">{status}</p>
      {removed&&<button className="ghost-button" type="button" onClick={()=>{setNotes(all=>[...all,removed]);setRemoved(null)}}>Undo remove</button>}
    </form><section aria-label="Joe’s sticky note wall"><p className="note-wall-caption">Drag the top of a note to move it. Or select its top and use the arrow keys.</p><div className="note-wall" ref={wall} style={{minHeight:Math.max(760,...notes.map(n=>n.y+450))}}>
      {!notes.length&&<div className="wall-empty"><h2>Your wall starts here.</h2><p>Write an idea and stick it up.</p></div>}
      {notes.map(note=><article className="sticky-note" key={note.id} style={{background:note.colour,left:`calc(${note.x}% - ${note.x/100} * var(--note-width, 220px))`,top:note.y}}>
        <button className="note-handle" aria-label={`Move ${note.title||'note'}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:note.id,startX:e.clientX,startY:e.clientY,x:note.x,y:note.y}}} onPointerMove={e=>{const d=drag.current;if(!d||d.id!==note.id||!wall.current)return;const width=wall.current.clientWidth-e.currentTarget.parentElement!.clientWidth;move(note.id,d.x+(e.clientX-d.startX)/Math.max(1,width)*100,d.y+e.clientY-d.startY)}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} onKeyDown={e=>{const delta=e.shiftKey?10:3;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();move(note.id,note.x+(e.key==='ArrowRight'?delta:e.key==='ArrowLeft'?-delta:0),note.y+(e.key==='ArrowDown'?delta*4:e.key==='ArrowUp'?-delta*4:0))}}}>⠿ Move</button>
        {note.title&&<h2>{note.title}</h2>}<p>{note.body}</p><div className="note-tools"><button onClick={()=>{setEditing(note.id);setDraft({title:note.title,body:note.body,colour:note.colour});titleInput.current?.focus()}}>Edit</button><button onClick={()=>{setRemoved(note);setNotes(all=>all.filter(n=>n.id!==note.id));if(editing===note.id){setEditing(null);setDraft(blank)}}}>Remove</button></div>
      </article>)}
    </div></section></div></main>
}
