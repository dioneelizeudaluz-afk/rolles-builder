export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "O prompt é obrigatório"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
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
                  text: `Você é o motor de desenvolvimento do Rolles.
Crie soluções web modernas, funcionais e responsivas.
Analise cuidadosamente o pedido do utilizador e responda com um plano técnico claro.

Pedido:
${prompt}`
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
        error: data.error?.message || "Erro na API do Gemini"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar uma resposta.";

    return res.status(200).json({ result: text });

  } catch (error) {
    return res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
      }
