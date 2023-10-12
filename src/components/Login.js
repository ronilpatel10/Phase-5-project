import { useState } from "react";
const Login = (props) => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.status === 200) {
            setMessage(data.message);

            // Store the token and the username in local storage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('loggedInUser', data.username);

            // Notify the App component about the successful login
            props.onLoginSuccess(data.username);
        } else {
            setMessage(data.message);
        }
    } catch (err) {
        console.error("Error:", err);
        setMessage("Error logging in");
    }
};


  return (
    <div className="login-form">
      <h2>Login</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
