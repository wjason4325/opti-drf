import { useState } from "react";
import React from "react";
import api from "../../api/client";

export default function Home() {
  const [name, setName] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/api/finance/accounts/");
      setResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResponse(null);
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/finance/accounts/", {
        name: name,
      });
      setResponse(res.data);
      setError(null);
      setName("");
    } catch (err) {
      setError(err.response?.data || err.message);
      setResponse(null);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>API Test Console</h1>

      <section>
        <h2>GET Accounts</h2>
        <button onClick={fetchAccounts}>Fetch Accounts</button>
      </section>

      <hr />

      <section>
        <h2>POST Account</h2>
        <form onSubmit={createAccount}>
          <input
            type="text"
            placeholder="Account name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <br />
          <button type="submit">Create Account</button>
        </form>
      </section>

      <hr />

      <section>
        <h2>Response</h2>
        <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
          {response && JSON.stringify(response, null, 2)}
          {error && JSON.stringify(error, null, 2)}
        </pre>
      </section>
    </div>
  );
}
