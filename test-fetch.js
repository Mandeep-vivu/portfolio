const test = async () => {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "What is his strongest technical stack?" }] })
  });
  const text = await res.text();
  console.log("RESPONSE: ", text);
};
test();
