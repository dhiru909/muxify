import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/authContext";

function Login() {

  const [error,setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {updateUser} = useContext(AuthContext)

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const res = await apiRequest.post("/auth/login", {username, password});

      updateUser(res.data)

      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred";
      setError(errorMessage);
    } finally{
      setIsLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <input name="username" type="text" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button disabled={isLoading}>Login</button>
          {error && <span>{error}</span>}
          <Link to="/register">{"Don't"} you have an account?</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Login;