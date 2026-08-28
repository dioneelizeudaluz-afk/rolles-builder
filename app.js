const $=s=>document.querySelector(s);
const views={builder:"builderView",projects:"projectsView",files:"filesView",history:"historyView"};
let projects=JSON.parse(localStorage.getItem("rolles_projects")||"[]");

function renderProjects(){
  const box=$("#projectList"); box.innerHTML="";
  projects.forEach((p,i)=>{
    const el=document.createElement("button");
    el.className="nav"; el.style.border="1px solid #202c39"; el.style.marginBottom="8px";
    el.textContent=p.name||"Projeto sem nome";
    el.onclick=()=>{ $("#projectName").value=p.name; $("#prompt").value=p.prompt; $("#output").textContent=p.plan||"Projeto carregado."; show("builder"); };
    box.appendChild(el);
  });
}
function show(name){
  Object.values(views).forEach(id=>$("#"+id).classList.add("hidden"));
  $("#"+views[name]).classList.remove("hidden");
  document.querySelectorAll(".nav[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  $("#title").textContent=name==="builder"?($("#projectName").value||"Novo projeto"):name[0].toUpperCase()+name.slice(1);
}
document.querySelectorAll(".nav[data-view]").forEach(b=>b.onclick=()=>show(b.dataset.view));

$("#generate").onclick=()=>{
  const prompt=$("#prompt").value.trim();
  if(!prompt){$("#output").textContent="Escreva primeiro o que deseja construir.";return}
  $("#output").textContent=`PLANO ROLLES

1. Analisar requisitos
2. Definir páginas e componentes
3. Preparar frontend
4. Preparar backend/API
5. Configurar base de dados
6. Validar funcionalidades
7. Gerar preview

Pedido:
${prompt}

[IA externa ainda não conectada]`;
};
$("#saveProject").onclick=()=>{
  const name=$("#projectName").value.trim()||"Projeto "+(projects.length+1);
  const item={name,prompt:$("#prompt").value,plan:$("#output").textContent,date:new Date().toISOString()};
  projects=[...projects.filter(p=>p.name!==name),item];
  localStorage.setItem("rolles_projects",JSON.stringify(projects)); renderProjects(); show("projects");
};
$("#newProject").onclick=()=>{ $("#projectName").value="";$("#prompt").value="";$("#output").textContent="Escreva um prompt e clique em “Gerar plano”.";show("builder"); };
renderProjects();
