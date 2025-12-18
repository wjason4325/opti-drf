import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Center,
  Stack,
  Text,
  Anchor,
} from "@mantine/core";
import api from "../../api/client";

export default function Login() {
  const navigate = useNavigate();

  // Toggle between Login and Register
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        // --- REGISTER LOGIC ---
        // 1. Create the user
        await api.post("/api/auth/register/", { username, password });
        
        // 2. Immediately login to get tokens
        const res = await api.post("/api/auth/login/", { username, password });
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        
        navigate("/");
      } else {
        // --- LOGIN LOGIC ---
        const res = await api.post("/api/auth/login/", { username, password });
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        navigate("/");
      }
    } catch (err) {
      if (isRegister) {
        setError("Username already exists or password is too weak.");
      } else {
        setError("Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Paper withBorder shadow="md" p="xl" radius="md" style={{ width: 360 }}>
        <Title order={2} align="center" mb="md">
          {isRegister ? "Create Account" : "Sign In"}
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <Text size="sm" c="red">
                {error}
              </Text>
            )}

            <Button type="submit" loading={loading} fullWidth>
              {isRegister ? "Sign Up" : "Login"}
            </Button>

            <Text align="center" size="sm" mt="xs">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <Anchor
                component="button"
                type="button"
                onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                }}
              >
                {isRegister ? "Login" : "Register"}
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}