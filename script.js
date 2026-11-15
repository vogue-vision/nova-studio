const $=id=>document.getElementById(id);
let scenes=[],selected=-1,clips=[],projects=JSON.parse(localStorage.getItem('novaProjects')||'[]'),currentTitle='Untitled Roblox story';
const templates=[
 ['The Ordinary World','Introduce the hero, their friends and the world before anything changes.'],
 ['The Strange Discovery','A mysterious event reveals that something unusual is happening.'],
 ['A New Beginning','The hero is invited into a secret place where they can learn more.'],
 ['Training Day','The hero tests their new ability and struggles to control it.'],
 ['The Rival','A rival challenges the hero, creating tension and a difficult choice.'],
 ['The Team','New allies join forces and uncover a clue about the danger.'],
 ['The Hidden Threat','The group discovers the villain’s plan and must escape.'],
 ['The Final Battle','The hero and their team face the threat in an action-packed showdown.'],
 ['A New Era','The city begins to recover and the hero sees how much has changed.'],
 ['The Cliffhanger','A mysterious message hints that an even bigger danger is coming.']
];
function toast(msg){let t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function switchView(view){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(view+'View').classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('pageTitle').textContent={create:'Create your next story',projects:'Your projects',characters:'Character lab'}[view];if(view==='projects')renderProjects()}
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
function switchMode(mode){document.querySelectorAll('.mode-tab').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));$('storyMode').classList.toggle('hidden',mode!=='story');$('uploadMode').classList.toggle('hidden',mode!=='upload')}
document.querySelectorAll('.mode-tab').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
function generate(){let prompt=$('storyPrompt').value.trim();if(!prompt){toast('Write a short story idea first.');$('storyPrompt').focus();return}
let n=+$('length').value,hero=$('heroName').value.trim()||'Hero',power=$('power').value.trim()||'mystery power';
currentTitle=prompt.split(/[.!?]/)[0].slice(0,48)||'My Roblox story';
scenes=templates.slice(0,n).map((t,i)=>({title:t[0],desc:t[1]+' Story idea: '+prompt,dialogue:i===0?hero+': “Something about today feels different.”':i===n-1?'Unknown voice: “This is only the beginning.”':hero+': “I have to find out what is really happening.”',visual:['City establishing shot','Glowing power reveal','Academy or secret location','Training montage','Face-off close-up','Team hero shot','Dark suspense reveal','Cinematic boss fight','Sunrise city wide shot','Mysterious final close-up'][i]}));
scenes[1]&&(scenes[1].desc+=' '+hero+' begins to discover '+power+'.');selected=0;renderScenes();toast('Your storyboard is ready to edit!');}
$('generateStory').onclick=generate;
function renderScenes(){let grid=$('sceneGrid');if(!scenes.length){grid.innerHTML='<div class="empty-story"><div>✧</div><b>Your storyboard starts here</b><p>Describe your story above and generate your first scenes.</p></div>';return}
grid.innerHTML=scenes.map((s,i)=>`<button class="scene-card ${i===selected?'selected':''}" data-index="${i}"><span class="scene-number">SCENE ${String(i+1).padStart(2,'0')} · ${escapeHtml(s.visual)}</span><b>${escapeHtml(s.title)}</b><p>${escapeHtml(s.desc.slice(0,105))}${s.desc.length>105?'…':''}</p></button>`).join('');
grid.querySelectorAll('.scene-card').forEach(b=>b.onclick=()=>selectScene(+b.dataset.index));if(selected>=0)showScene()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function selectScene(i){selected=i;renderScenes()}
function showScene(){let s=scenes[selected];if(!s)return;$('scenePreview').classList.add('hidden');$('previewFields').classList.remove('hidden');$('editSceneTitle').value=s.title;$('editSceneDesc').value=s.desc;$('editDialogue').value=s.dialogue}
['editSceneTitle','editSceneDesc','editDialogue'].forEach((id,k)=>$(id).addEventListener('input',()=>{if(selected<0)return;scenes[selected][['title','desc','dialogue'][k]]=$(id).value;let cards=document.querySelectorAll('.scene-card');if(cards[selected]){cards[selected].querySelector('b').textContent=scenes[selected].title;cards[selected].querySelector('p').textContent=scenes[selected].desc.slice(0,105)}}));
$('addScene').onclick=()=>{scenes.push({title:'New scene',desc:'Describe what happens in this scene.',dialogue:'',visual:'Custom shot'});selected=scenes.length-1;renderScenes();toast('Scene added.')};
$('deleteScene').onclick=()=>{if(selected<0)return;scenes.splice(selected,1);selected=scenes.length?Math.min(selected,scenes.length-1):-1;renderScenes();if(selected<0){$('previewFields').classList.add('hidden');$('scenePreview').classList.remove('hidden')}toast('Scene deleted.')};
$('clipInput').onchange=e=>{clips.forEach(c=>URL.revokeObjectURL(c.url));clips=Array.from(e.target.files).map(f=>({file:f,url:URL.createObjectURL(f)}));renderClips()};
function renderClips(){$('clipList').innerHTML=clips.length?clips.map((c,i)=>`<div class="clip-item"><video src="${c.url}" controls muted></video><div><b>${escapeHtml(c.file.name)}</b><small>${(c.file.size/1048576).toFixed(1)} MB · Clip ${i+1}</small></div></div>`).join(''):'<div class="empty-state">Your uploaded clips will appear here.</div>'}
$('makeClipProject').onclick=()=>{if(!clips.length){toast('Upload at least one video clip first.');return}currentTitle=$('clipTitle').value||'My Roblox montage';scenes=clips.map((c,i)=>({title:'Clip '+(i+1),desc:c.file.name+' — local video preview. Add your own notes and editing directions.',dialogue:'',visual:'Uploaded footage'}));selected=0;renderScenes();switchMode('story');toast('Clip project created. Your files remain local to this browser.')};
function projectData(){return {title:currentTitle,created:new Date().toISOString(),scenes:scenes,clipNames:clips.map(c=>c.file.name)}}
function save(){let p=projectData();let idx=projects.findIndex(x=>x.title===p.title);if(idx>=0)projects[idx]=p;else projects.unshift(p);localStorage.setItem('novaProjects',JSON.stringify(projects));toast('Project saved in this browser.')}
$('saveProject').onclick=save;
$('exportProject').onclick=()=>{let data=projectData(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(currentTitle.replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'nova-project')+'.json';a.click();URL.revokeObjectURL(a.href);toast('Project file exported.');};
function renderProjects(){$('projectsList').innerHTML=projects.length?projects.map((p,i)=>`<div class="project-tile"><span class="eyebrow">SAVED PROJECT</span><b>${escapeHtml(p.title)}</b><small>${p.scenes.length} scenes · ${new Date(p.created).toLocaleDateString()}</small><br><button class="outline-btn" data-project="${i}">Open project</button></div>`).join(''):'<div class="empty-state">No saved projects yet. Create a storyboard and choose Save project.</div>';document.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{let p=projects[+b.dataset.project];currentTitle=p.title;scenes=p.scenes;selected=scenes.length?0:-1;renderScenes();switchView('create');toast('Project opened.')})}
$('newProject').onclick=$('projectsNew').onclick=()=>{scenes=[];selected=-1;currentTitle='Untitled Roblox story';$('storyPrompt').value='';renderScenes();$('previewFields').classList.add('hidden');$('scenePreview').classList.remove('hidden');switchView('create');switchMode('story')};
renderScenes();
