import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppShell,
  Group,
  Title,
  Button,
  Tabs,
  Paper,
  TextInput,
  Select,
  Stack,
  Table,
  Text,
  Divider,
} from "@mantine/core";
import api from "../../api/client";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  // ---------- State ----------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [events, setEvents] = useState([]);

  // Create form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState("WORK");
  const [newEventCategoryId, setNewEventCategoryId] = useState(null);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories]
  );

  // ---------- Fetch ----------
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, tagRes, eventRes] = await Promise.all([
        api.get("/api/categories/"),
        api.get("/api/tags/"),
        api.get("/api/events/"),
      ]);
      setCategories(catRes.data);
      setTags(tagRes.data);
      setEvents(eventRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load data. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Create handlers ----------
  const createCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/categories/", { name: newCategoryName.trim() });
      setNewCategoryName("");
      await fetchAll();
    } catch (err) {
      setError(err.response?.data || "Create category failed");
      setLoading(false);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/tags/", { name: newTagName.trim() });
      setNewTagName("");
      await fetchAll();
    } catch (err) {
      setError(err.response?.data || "Create tag failed");
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!newEventTitle.trim()) return;
    if (!newEventCategoryId) {
      setError("Pick a category for the event.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/events/", {
        title: newEventTitle.trim(),
        event_type: newEventType,
        category: Number(newEventCategoryId),
      });
      setNewEventTitle("");
      setNewEventType("WORK");
      setNewEventCategoryId(null);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data || "Create event failed");
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <AppShell padding="md">
      <Group justify="space-between" align="center">
        <Title order={2}>Home</Title>
        <Group>
          <Button variant="default" onClick={fetchAll} loading={loading}>
            Refresh
          </Button>
          <Button color="red" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Group>

      <Divider my="md" />

      {error && (
        <Paper withBorder p="md" radius="md" mb="md">
          <Text c="red">{typeof error === "string" ? error : JSON.stringify(error)}</Text>
        </Paper>
      )}

      <Tabs defaultValue="events">
        <Tabs.List>
          <Tabs.Tab value="events">Events</Tabs.Tab>
          <Tabs.Tab value="categories">Categories</Tabs.Tab>
          <Tabs.Tab value="tags">Tags</Tabs.Tab>
        </Tabs.List>

        {/* -------- Events -------- */}
        <Tabs.Panel value="events" pt="md">
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">Create Event</Title>
            <Stack>
              <TextInput
                label="Title"
                placeholder="e.g., Dentist appointment"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />

              <Select
                label="Event Type"
                value={newEventType}
                onChange={(v) => setNewEventType(v || "WORK")}
                data={[
                  { value: "WORK", label: "Work" },
                  { value: "FINANCE", label: "Finance" },
                  { value: "MEDICAL", label: "Medical" },
                ]}
              />

              <Select
                label="Category"
                placeholder="Pick category"
                value={newEventCategoryId}
                onChange={setNewEventCategoryId}
                data={categoryOptions}
                searchable
                nothingFoundMessage="No categories yet — create one first"
              />

              <Button onClick={createEvent} loading={loading}>
                Create Event
              </Button>
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md" mt="md">
            <Title order={4} mb="sm">Events</Title>

            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Category</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {events.map((e) => (
                  <Table.Tr key={e.id}>
                    <Table.Td>{e.id}</Table.Td>
                    <Table.Td>{e.title}</Table.Td>
                    <Table.Td>{e.event_type}</Table.Td>
                    <Table.Td>{e.category_name || e.category}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        {/* -------- Categories -------- */}
        <Tabs.Panel value="categories" pt="md">
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">Create Category</Title>
            <Stack>
              <TextInput
                label="Name"
                placeholder="e.g., Personal, Career, Health"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={createCategory} loading={loading}>
                Create Category
              </Button>
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md" mt="md">
            <Title order={4} mb="sm">Categories</Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td>{c.id}</Table.Td>
                    <Table.Td>{c.name}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        {/* -------- Tags -------- */}
        <Tabs.Panel value="tags" pt="md">
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">Create Tag</Title>
            <Stack>
              <TextInput
                label="Name"
                placeholder="e.g., urgent, follow-up, recurring"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <Button onClick={createTag} loading={loading}>
                Create Tag
              </Button>
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md" mt="md">
            <Title order={4} mb="sm">Tags</Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tags.map((t) => (
                  <Table.Tr key={t.id}>
                    <Table.Td>{t.id}</Table.Td>
                    <Table.Td>{t.name}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
