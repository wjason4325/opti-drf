import React from "react";
import { useState } from "react";
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
} from "@mantine/core";
import api from "../../api/client";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login/", {
        username,
        password,
      });

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      navigate("/");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: "100vh" }}>
      <Paper withBorder shadow="md" p="xl" radius="md" style={{ width: 360 }}>
        <Title order={2} align="center" mb="md">
          Sign in
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
              <Text size="sm" color="red">
                {error}
              </Text>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
