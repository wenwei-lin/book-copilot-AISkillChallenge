export default async function (req, res) {

  const response = await fetch(process.env.LCC_ENDPOINT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: req.body.query,
      history: req.body.history,
      knowledge_base_name: "books",
      top_k: 6,
      score_threshold: 0.8,
      stream: false,
      local_doc_url: false
    }),
  });

    const data = await response.json();

    res.status(200).json({ result: data })
}