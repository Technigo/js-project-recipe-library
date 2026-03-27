import { useState } from "react";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

    fetch("http://localhost:8080/users", {
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
      <h1>SIGN UP</h1>
      <label htmlFor="email">Email</label>
      <input
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        type="email"
        name="email"
      />

      <label htmlFor="password">Password</label>
      <input
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        type="password"
        name="password"
      />

      <button type="submit">Sign up</button>
    </form>
  );
};

export default SignupForm;