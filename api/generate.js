export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "O prompt é obrigatório."
      });
    }

    const instruction = `
Você é o motor de desenvolvimento do Rolles.

O utilizador vai pedir para criar ou modificar um aplicativo web.

Sua tarefa é criar uma especificação e os arquivos necessários para um MVP
funcional.

O projeto pode ser qualquer tipo de aplicativo web.

Gere código REAL e funcional.

REGRAS:

1. Crie uma interface moderna, bonita e responsiva.
2. Use React + Vite quando for apropriado.
3. Use componentes reutilizáveis.
4. Não invente funcionalidades impossíveis.
5. Não use dados falsos quando uma base de dados real for necessária.
6. Quando o projeto precisar de banco de dados, prepare a integração com Supabase.
7. Quando precisar de autenticação, prepare autenticação real.
8. Não coloque chaves secretas dentro do código frontend.
9. Gere apenas os arquivos realmente necessários.
10. O código deve ser completo, não apenas exemplos.

RESPONDA SOMENTE COM JSON VÁLIDO.

Formato obrigatório:

{
  "projectName": "Nome do projeto",
  "description": "Descrição",
  "stack": {
    "frontend": "React + Vite",
    "database": "Supabase"
  },
  "files": [
    {
      "path": "package.json",
      "content": "código completo do arquivo"
    },
    {
      "path": "index.html",
      "content": "código completo do arquivo"
    },
    {
      "path": "src/App.jsx",
      "content": "código completo do arquivo"
    }
  ],
  "database": {
    "required": true,
    "sql": "SQL completo para criar as tabelas necessárias"
  }
}

IMPORTANTE:
- Não use markdown.
- Não coloque \`\`\`.
- Não escreva explicações fora do JSON.
- Cada arquivo deve ter seu código completo dentro de "content".
- O JSON precisa ser válido.

PEDIDO DO UTILIZADOR:
${prompt}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: instruction
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Erro na API do Gemini."
      });
    }

    let text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let project;

    try {
      project = JSON.parse(text);
    } catch (error) {
      return res.status(500).json({
        error: "A IA retornou JSON inválido.",
        raw: text
      });
    }

    return res.status(200).json({
      success: true,
      project
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro interno do servidor."
    });
  }
}
