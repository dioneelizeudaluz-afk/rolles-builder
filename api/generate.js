export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "O prompt é obrigatório."
      });
    }

    const systemPrompt = `
Você é o motor de desenvolvimento do Rolles.

Sua função é analisar o pedido do utilizador e planejar um aplicativo web real.

O aplicativo pode ser qualquer tipo de projeto: SaaS, marketplace,
sistema de gestão, dashboard, site, ferramenta interna, plataforma,
aplicativo educacional, sistema de documentos, etc.

Analise:
- objetivo
- páginas
- funcionalidades
- componentes
- dados necessários
- autenticação
- banco de dados
- APIs
- segurança
- responsividade

IMPORTANTE:
Nesta etapa NÃO gere código completo.
Gere somente uma especificação estruturada do projeto.

Responda EXATAMENTE neste formato JSON:

{
  "projectName": "Nome do projeto",
  "description": "Descrição curta",
  "pages": [
    {
      "name": "Nome da página",
      "purpose": "Objetivo da página"
    }
  ],
  "features": [
    "Funcionalidade 1",
    "Funcionalidade 2"
  ],
  "database": {
    "required": true,
    "tables": [
      {
        "name": "nome_da_tabela",
        "purpose": "Para que serve"
      }
    ]
  },
  "authentication": {
    "required": false,
    "type": "Nenhuma"
  },
  "recommendedStack": {
    "frontend": "React",
    "backend": "API",
    "database": "Supabase"
  }
}

Não coloque markdown.
Não coloque explicações antes ou depois do JSON.
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
                  text:
                    systemPrompt +
                    "\n\nPEDIDO DO UTILIZADOR:\n" +
                    prompt
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
    } catch {
      return res.status(500).json({
        error: "A IA retornou um formato inválido.",
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
