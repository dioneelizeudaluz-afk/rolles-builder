const $ = (selector) => document.querySelector(selector);

let projects = JSON.parse(
  localStorage.getItem("rolles_projects") || "[]"
);

let currentProject = null;
let currentFile = null;

function showView(view) {
  document.querySelectorAll("[data-view]").forEach((el) => {
    el.classList.add("hidden");
  });

  const target = document.getElementById(view);

  if (target) {
    target.classList.remove("hidden");
  }

  document.querySelectorAll(".nav").forEach((button) => {
    button.classList.remove("active");
  });
}

function openFile(file) {
  currentFile = file;

  const name = $("#currentFileName");
  const editor = $("#codeEditor");

  if (name) {
    name.textContent = file.path || "Arquivo";
  }

  if (editor) {
    editor.value = file.content || "";
  }
}

function renderProject(project) {
  currentProject = project;

  const projectName = $("#projectNameDisplay");
  const description = $("#projectDescription");
  const fileList = $("#fileList");

  if (projectName) {
    projectName.textContent =
      project.projectName || "Projeto sem nome";
  }

  if (description) {
    description.textContent =
      project.description || "";
  }

  if (!fileList) return;

  fileList.innerHTML = "";

  const files = Array.isArray(project.files)
    ? project.files
    : [];

  if (files.length === 0) {
    fileList.innerHTML =
      "<p style='color:#9aa8b7;padding:10px'>Nenhum arquivo gerado.</p>";
    return;
  }

  files.forEach((file, index) => {
    const button = document.createElement("button");

    button.className = "file-item";
    button.textContent = "📄 " + file.path;

    button.addEventListener("click", () => {
      openFile(file);
    });

    fileList.appendChild(button);

    if (index === 0) {
      openFile(file);
    }
  });
}

function saveCurrentFile() {
  if (!currentProject || !currentFile) return;

  currentFile.content =
    $("#codeEditor")?.value || "";

  localStorage.setItem(
    "rolles_current_project",
    JSON.stringify(currentProject)
  );

  if ($("#output")) {
    $("#output").textContent =
      `Arquivo "${currentFile.path}" salvo.`;
  }
}

async function generateProject() {
  const promptElement = $("#prompt");
  const output = $("#output");
  const button = $("#generate");

  const prompt = promptElement?.value.trim();

  if (!prompt) {
    if (output) {
      output.textContent =
        "Escreva primeiro o que deseja criar.";
    }
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "Gerando projeto...";
  }

  if (output) {
    output.textContent =
      "O Rolles está construindo o projeto...";
  }

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Erro na API."
      );
    }

    if (!data.project) {
      throw new Error(
        "A IA não retornou um projeto válido."
      );
    }

    currentProject = data.project;

    localStorage.setItem(
      "rolles_current_project",
      JSON.stringify(currentProject)
    );

    projects.push({
      name:
        currentProject.projectName ||
        "Projeto sem nome",

      project: currentProject,

      createdAt:
        new Date().toISOString()
    });

    localStorage.setItem(
      "rolles_projects",
      JSON.stringify(projects)
    );

    if (output) {
      output.textContent =
        `Projeto "${currentProject.projectName}" gerado com sucesso.\n\n` +
        `${currentProject.files?.length || 0} arquivos recebidos.`;
    }

    renderProject(currentProject);

    showView("editor");

  } catch (error) {

    console.error(error);

    if (output) {
      output.textContent =
        "Erro: " + error.message;
    }

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent = "Gerar projeto";
    }
  }
}

function setupNavigation() {
  document.querySelectorAll(".nav").forEach((button) => {

    button.addEventListener("click", () => {

      const text =
        button.textContent.trim().toLowerCase();

      if (text.includes("builder")) {
        showView("builderView");
      }

      if (text.includes("projetos")) {
        showView("projectsView");
      }

      if (text.includes("arquivos")) {
        showView("filesView");
      }

      if (text.includes("histórico")) {
        showView("historyView");
      }
    });

  });
}

if ($("#generate")) {
  $("#generate").addEventListener(
    "click",
    generateProject
  );
}

if ($("#saveFile")) {
  $("#saveFile").addEventListener(
    "click",
    saveCurrentFile
  );
}

if ($("#newProject")) {
  $("#newProject").addEventListener(
    "click",
    () => {

      if ($("#prompt")) {
        $("#prompt").value = "";
      }

      if ($("#output")) {
        $("#output").textContent =
          "Escreva o que deseja criar.";
      }

      showView("builderView");
    }
  );
}

setupNavigation();

const savedProject =
  localStorage.getItem(
    "rolles_current_project"
  );

if (savedProject) {

  try {

    currentProject =
      JSON.parse(savedProject);

  } catch {

    currentProject = null;

  }

    }
