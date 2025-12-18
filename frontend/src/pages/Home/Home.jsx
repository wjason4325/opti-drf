import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppShell,
  Button,
  Group,
  Title,
  Table,
  Paper,
  TextInput,
  Textarea,
  Select,
  Stack,
  Modal,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { DateTimePicker, Calendar } from "@mantine/dates";
import { IconPlus, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import dayjs from "dayjs";
import api from "../../api/client";

export default function Home() {

    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
    };

  // ---------- State ----------
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  // modal + form
  const [opened, setOpened] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [setDate, setSetDate] = useState(null);

  // ---------- Fetch ----------
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/events/");
      setEvents(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ---------- Sorting ----------
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const d1 = new Date(a.set_date);
      const d2 = new Date(b.set_date);
      return sortAsc ? d1 - d2 : d2 - d1;
    });
  }, [events, sortAsc]);

  // ---------- Create / Update ----------
  const openCreate = () => {
    setEditingEvent(null);
    setTitle("");
    setNotes("");
    setSetDate(null);
    setOpened(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setNotes(event.notes || "");
    setSetDate(new Date(event.set_date));
    setOpened(true);
  };

  const saveEvent = async () => {
    const payload = {
      title,
      notes,
      set_date: dayjs(setDate).toISOString(),
    };

    if (editingEvent) {
      await api.put(`/api/events/${editingEvent.id}/`, payload);
    } else {
      await api.post("/api/events/", payload);
    }

    setOpened(false);
    fetchEvents();
  };

  // ---------- Delete ----------
  const deleteEvent = async (id) => {
    await api.delete(`/api/events/${id}/`);
    fetchEvents();
  };

  // ---------- Calendar data ----------
  const eventDates = events.map((e) => new Date(e.set_date));

  return (
    
    <AppShell padding="md">
      {/* ---------- LOGOUT ---------- */}
      <Group justify="flex-end" mb="md">
        <Button variant="outline" color="red" onClick={handleLogout}>
            Logout
        </Button>
        </Group>
        {/* ---------- TOP SECTION ---------- */}
      <Group justify="space-between" mb="md">
        <Title order={2}>Upcoming Events</Title>

        <Group>
          <ActionIcon onClick={() => setSortAsc(!sortAsc)}>
            {sortAsc ? <IconSortAscending /> : <IconSortDescending />}
          </ActionIcon>

          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Add Event
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {sortedEvents.map((e) => (
              <Table.Tr key={e.id} onClick={() => openEdit(e)} style={{ cursor: "pointer" }}>
                <Table.Td>{e.title}</Table.Td>
                <Table.Td>{dayjs(e.set_date).format("MMM D, YYYY HH:mm")}</Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    color="red"
                    variant="subtle"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      deleteEvent(e.id);
                    }}
                  >
                    Delete
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* ---------- BOTTOM SECTION ---------- */}
      <Divider my="xl" />

      <Title order={3} mb="sm">
        Calendar View
      </Title>

      <Paper withBorder p="md" radius="md">
      <Calendar
        renderDay={(date) => {
            const hasEvent = eventDates.some(
            (d) =>
                dayjs(d).format("YYYY-MM-DD") ===
                dayjs(date).format("YYYY-MM-DD")
            );

            return (
            <div
                style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: hasEvent ? "#228be6" : undefined,
                color: hasEvent ? "white" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                }}
            >
                {dayjs(date).date()}
            </div>
            );
        }}
        />
      </Paper>

      {/* ---------- MODAL ---------- */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingEvent ? "Edit Event" : "New Event"}
        centered
      >
        <Stack>
          <TextInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <DateTimePicker
            label="Event Date"
            value={setDate}
            onChange={setSetDate}
            required
          />

          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            autosize
            minRows={3}
          />

          <Button onClick={saveEvent}>
            {editingEvent ? "Update Event" : "Create Event"}
          </Button>
        </Stack>
      </Modal>
    </AppShell>
  );
}
