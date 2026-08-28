const $ = (selector) => document.querySelector(selector);

const views = {
  builder: "builderView",
  projects: "projectsView",
  files: "filesView",
  history: "historyView"
};

let projects = JSON.parse(
  localStorage.getItem("rolles_projects") || "[]"
);

function renderProjects() {
  const box = $("#projectList");
  box.innerHTML = "";

  projects.forEach((project) => {
    const button = document.createElement("button");

    button.className = "nav";
    button.style.border = "1px solid #202c39";
    button.style.marginBottom = "8px";
    button.textContent = project.name;

    button.onclick = () => {
      $("#projectName").value = project.name;
      $("#prompt").value = project.prompt;
      $("#output").textContent = project.plan || "";
      show("builder");
    };

    box.appendChild(button);
  });
}

function show(name) {
  Object.values(views).forEach((id) => {
    $("#" + id).classList.add("hidden");
  });

  $("#" + views[name]).classList.remove("hidden");

  document
    .querySelectorAll(".nav[data-view]")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.view === name
      );
    });

  $("#title").textContent =
    name === "builder"
      ? ($("#projectName").value || "Novo projeto")
      : name.charAt(0).toUpperCase() + name.slice(1);
}

document
  .querySelectorAll(".nav[data-view]")
  .forEach((button) => {
    button.onclick = () => show(button.dataset.view);
  });

$("#generate").onclick = async () => {
  const prompt = $("#prompt").value.trim();

  if (!prompt) {
    $("#output").textContent =
      "Escreva primeiro o que deseja construir.";
    return;
  }

  const button = $("#generate");

  button.disabled = true;
  button.textContent = "Gerando...";

  $("#output").textContent =
    "O Rolles está analisando o seu pedido...";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Erro ao comunicar com a IA."
      );
    }

    if (data.project) {
  $("#output").textContent = JSON.stringify(
    data.project,
    null,
    2
  );
} else {
  $("#output").textContent =
    "A IA não retornou uma resposta.";
      }

  } catch (error) {
    $("#output").textContent =
      "Erro: " + error.message;

  } finally {
    button.disabled = false;
    button.textContent = "Gerar plano";
  }
};

$("#saveProject").onclick = () => {
  const name =
    $("#projectName").value.trim() ||
    "Projeto " + (projects.length + 1);

  const project = {
    name: name,
    prompt: $("#prompt").value,
    plan: $("#output").textContent,
    date: new Date().toISOString()
  };

  projects = [
    ...projects.filter((p) => p.name !== name),
    project
  ];

  localStorage.setItem(
    "rolles_projects",
    JSON.stringify(projects)
  );

  renderProjects();
  show("projects");
};

$("#newProject").onclick = () => {
  $("#projectName").value = "";
  $("#prompt").value = "";
  $("#output").textContent =
    "Escreva um prompt e clique em “Gerar plano”.";

  show("builder");
};

renderProjects();
