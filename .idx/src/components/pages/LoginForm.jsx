import { useState } from "react";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in both fields");
      return;
    }

    setError("");

    fetch("http://localhost:8080/users/login", {
      method: "POST",
      body: JSON.stringify({ email: formData.email, password: formData.password }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(() => {
        // Reset form
        e.target.reset()
      })
      .catch(error => {
        console.log(error)
      })

  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>LOG IN</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <label htmlFor="email">Email</label>
      <input
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        type="email"
        name="email"
        value={formData.email}
      />
      <label htmlFor="password">Password</label>
      <input
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        type="password"
        name="password"
        value={formData.password}
      />
      <button type="submit">Log In</button>
    </form>
  );
};

export default LoginForm;