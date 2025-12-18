import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppShell, Button, Group, Title, Table, Paper, TextInput, 
  Textarea, Select, Stack, Modal, ActionIcon, Divider, Center, 
  Loader, Grid, Badge, ScrollArea, Container, Text, Box, ThemeIcon
} from "@mantine/core";
import { DateTimePicker, Calendar } from "@mantine/dates";
import { 
  IconPlus, IconSortAscending, IconSortDescending, IconTrash, IconLogout, 
  IconMinus, IconStethoscope, IconBriefcase, IconCash, IconCalendarEvent,
  IconMapPin, IconPill, IconCurrencyDollar, IconRepeat, IconUser,
  IconTrendingUp, IconTrendingDown
} from "@tabler/icons-react";
import dayjs from "dayjs";
import api from "../../api/client";

// --- INITIAL STATES ---
const INITIAL_EVENT_STATE = {
  title: "", notes: "", set_date: null, eventType: "generic",
  medicalReason: "", medicalProvider: "", medicalMedication: "",
  workOccurrence: "", workLocation: "",
  financeOccurrence: "", financeAmount: "", financeRecurring: false
};

const INITIAL_TX_STATE = {
  title: "", notes: "", amount: "", transaction_type: "expense", transaction_date: null
};

export default function Home() {
  const navigate = useNavigate();

  // --- Data State ---
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- UI State ---
  const [opened, setOpened] = useState(false);
  const [modalType, setModalType] = useState("event");
  const [editingId, setEditingId] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [txSortAsc, setTxSortAsc] = useState(true);

  // --- Form States ---
  const [eventForm, setEventForm] = useState(INITIAL_EVENT_STATE);
  const [txForm, setTxForm] = useState(INITIAL_TX_STATE);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, txRes] = await Promise.all([
        api.get("/api/events/"),
        api.get("/api/transactions/")
      ]);
      setEvents(eventsRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Helpers ---
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const closeModal = () => {
    setOpened(false);
    setEditingId(null);
    setEventForm(INITIAL_EVENT_STATE);
    setTxForm(INITIAL_TX_STATE);
  };

  // --- Helper: Detect Event Type for Rows ---
  const getEventMeta = (event) => {
    if ("reason" in event) {
        return { type: 'medical', icon: <IconStethoscope size={16} />, color: 'red', label: 'Medical' };
    } else if ("expected_amount" in event) {
        return { type: 'financial', icon: <IconCash size={16} />, color: 'teal', label: 'Financial' };
    } else if ("location" in event) {
        return { type: 'work', icon: <IconBriefcase size={16} />, color: 'blue', label: 'Work' };
    }
    return { type: 'generic', icon: <IconCalendarEvent size={16} />, color: 'gray', label: 'Generic' };
  };

  // --- Handlers ---
  const openCreateEvent = () => {
    setModalType("event");
    setEditingId(null);
    setEventForm(INITIAL_EVENT_STATE);
    setOpened(true);
  };

  const openEditEvent = (event) => {
    setModalType("event");
    setEditingId(event.id);
    
    // Determine type using the same logic
    const { type } = getEventMeta(event);

    setEventForm({
      title: event.title,
      notes: event.notes || "",
      set_date: new Date(event.set_date),
      eventType: type,
      medicalReason: event.reason || "",
      medicalProvider: event.provider || "",
      medicalMedication: event.medication || "",
      workOccurrence: event.occurrence || "",
      workLocation: event.location || "",
      financeOccurrence: event.occurrence || "",
      financeAmount: event.expected_amount || "",
      financeRecurring: event.is_recurring || false,
    });
    setOpened(true);
  };

  const saveEvent = async () => {
    setSubmitting(true);
    const basePayload = {
      title: eventForm.title,
      notes: eventForm.notes,
      set_date: dayjs(eventForm.set_date).toISOString(),
    };

    let endpoint = "/api/events/";
    let payload = { ...basePayload };

    if (eventForm.eventType === "medical") {
      endpoint = "/api/medical-events/";
      payload = { ...payload, reason: eventForm.medicalReason, provider: eventForm.medicalProvider, medication: eventForm.medicalMedication };
    } else if (eventForm.eventType === "work") {
      endpoint = "/api/work-events/";
      payload = { ...payload, occurrence: eventForm.workOccurrence, location: eventForm.workLocation };
    } else if (eventForm.eventType === "financial") {
      endpoint = "/api/financial-events/";
      payload = { ...payload, occurrence: eventForm.financeOccurrence, expected_amount: eventForm.financeAmount, is_recurring: eventForm.financeRecurring };
    }

    try {
      if (editingId) await api.put(`${endpoint}${editingId}/`, payload);
      else await api.post(endpoint, payload);
      fetchData();
      closeModal();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateTx = () => {
    setModalType("transaction");
    setEditingId(null);
    setTxForm(INITIAL_TX_STATE);
    setOpened(true);
  };

  const openEditTx = (tx) => {
    setModalType("transaction");
    setEditingId(tx.id);
    setTxForm({
      title: tx.title,
      notes: tx.notes || "",
      amount: tx.amount,
      transaction_type: tx.transaction_type,
      transaction_date: new Date(tx.transaction_date),
    });
    setOpened(true);
  };

  const saveTransaction = async () => {
    setSubmitting(true);
    const payload = { ...txForm, transaction_date: dayjs(txForm.transaction_date).toISOString() };
    try {
      if (editingId) await api.put(`/api/transactions/${editingId}/`, payload);
      else await api.post("/api/transactions/", payload);
      fetchData();
      closeModal();
    } catch (err) {
      console.error("TX Save failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    const endpoint = type === "event" ? `/api/events/${id}/` : `/api/transactions/${id}/`;
    await api.delete(endpoint);
    fetchData();
  };

  // --- Helper to get icon for event type (For Modal) ---
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'medical': return <IconStethoscope size={18} />;
      case 'work': return <IconBriefcase size={18} />;
      case 'financial': return <IconCash size={18} />;
      default: return <IconCalendarEvent size={18} />;
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const diff = dayjs(a.set_date).diff(dayjs(b.set_date));
      return sortAsc ? diff : -diff;
    });
  }, [events, sortAsc]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const diff = dayjs(a.transaction_date).diff(dayjs(b.transaction_date));
      return txSortAsc ? diff : -diff;
    });
  }, [transactions, txSortAsc]);

  if (loading && events.length === 0) return <Center h="100vh"><Loader size="xl" /></Center>;

  return (
    <AppShell padding="md" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Container size="xl">
        
        {/* --- HEADER --- */}
        <Group justify="space-between" mb="xl" mt="sm">
          <Title order={1} c="blue.8">Dashboard</Title>
          <Button variant="light" color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
            Logout
          </Button>
        </Group>

        {/* --- MAIN GRID (Side by Side) --- */}
        <Grid gutter="xl">
          
          {/* --- LEFT COL: TRANSACTIONS --- */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="md" radius="lg" p="xl" withBorder h="100%">
              <Group justify="space-between" mb="lg">
                <Title order={3}>Transactions</Title>
                <Group gap="xs">
                  <ActionIcon variant="light" color="gray" onClick={() => setTxSortAsc(!txSortAsc)}>
                    {txSortAsc ? <IconSortAscending size={18} /> : <IconSortDescending size={18} />}
                  </ActionIcon>
                  <Button size="xs" leftSection={<IconPlus size={14} />} onClick={openCreateTx}>Add</Button>
                </Group>
              </Group>

              <ScrollArea h={350}>
                <Table verticalSpacing="sm" striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedTransactions.map((tx) => (
                      <Table.Tr key={tx.id} onClick={() => openEditTx(tx)} style={{ cursor: "pointer" }}>
                        <Table.Td>
                            <Group gap="xs">
                                <ThemeIcon 
                                    size="sm" 
                                    radius="xl" 
                                    color={tx.transaction_type === "expense" ? "red" : "green"} 
                                    variant="light"
                                >
                                    {tx.transaction_type === "expense" ? <IconTrendingDown size={14} /> : <IconTrendingUp size={14} />}
                                </ThemeIcon>
                                <Text fw={500}>{tx.title}</Text>
                            </Group>
                        </Table.Td>
                        <Table.Td c="dimmed">{dayjs(tx.transaction_date).format("MMM D")}</Table.Td>
                        <Table.Td>
                            <Badge 
                                color={tx.transaction_type === "expense" ? "red" : "green"} 
                                variant="light"
                            >
                                {tx.transaction_type === "expense" ? "-" : "+"}${tx.amount}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon color="red" variant="subtle" size="sm" onClick={(e) => { e.stopPropagation(); deleteItem("tx", tx.id); }}>
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                {sortedTransactions.length === 0 && <Text c="dimmed" ta="center" mt="xl">No transactions found.</Text>}
              </ScrollArea>
            </Paper>
          </Grid.Col>

          {/* --- RIGHT COL: EVENTS --- */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="md" radius="lg" p="xl" withBorder h="100%">
              <Group justify="space-between" mb="lg">
                <Title order={3}>Events</Title>
                <Group gap="xs">
                  <ActionIcon variant="light" color="gray" onClick={() => setSortAsc(!sortAsc)}>
                    {sortAsc ? <IconSortAscending size={18} /> : <IconSortDescending size={18} />}
                  </ActionIcon>
                  <Button size="xs" leftSection={<IconPlus size={14} />} onClick={openCreateEvent}>Add</Button>
                </Group>
              </Group>

              <ScrollArea h={350}>
                <Table verticalSpacing="sm" striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr><Table.Th>Title</Table.Th><Table.Th>Date</Table.Th><Table.Th></Table.Th></Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedEvents.map((e) => {
                      const meta = getEventMeta(e);
                      return (
                        <Table.Tr key={e.id} onClick={() => openEditEvent(e)} style={{ cursor: "pointer" }}>
                          <Table.Td>
                            <Group gap="xs">
                                <ThemeIcon size="sm" radius="xl" color={meta.color} variant="light">
                                    {meta.icon}
                                </ThemeIcon>
                                <Text fw={500}>{e.title}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td c="dimmed">{dayjs(e.set_date).format("MMM D, HH:mm")}</Table.Td>
                          <Table.Td>
                            <ActionIcon color="red" variant="subtle" size="sm" onClick={(ev) => { ev.stopPropagation(); deleteItem("event", e.id); }}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
                {sortedEvents.length === 0 && <Text c="dimmed" ta="center" mt="xl">No upcoming events.</Text>}
              </ScrollArea>
            </Paper>
          </Grid.Col>

          {/* --- BOTTOM: CALENDAR --- */}
          <Grid.Col span={12}>
            <Paper shadow="md" radius="lg" p="xl" withBorder mt="md">
                <Stack align="center">
                    <Title order={3} mb="md">Calendar Overview</Title>
                    <Calendar
                        size="xl" 
                        renderDay={(date) => {
                            const hasEvent = events.some(e => dayjs(e.set_date).isSame(dayjs(date), 'day'));
                            return (
                            <div style={{ 
                                width: 40, height: 40, 
                                borderRadius: "8px", 
                                backgroundColor: hasEvent ? "#228be6" : "transparent",
                                color: hasEvent ? "white" : "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: hasEvent ? "bold" : "normal"
                            }}>
                                {dayjs(date).date()}
                            </div>
                            );
                        }}
                    />
                </Stack>
            </Paper>
          </Grid.Col>

        </Grid>
      </Container>

      {/* --- MODAL --- */}
      <Modal opened={opened} onClose={closeModal} title={editingId ? "Edit Item" : "Create New"} size="lg" radius="md">
        <Stack>
          {modalType === "transaction" ? (
            <>
              <TextInput label="Title" required value={txForm.title} onChange={(e) => setTxForm({...txForm, title: e.target.value})} />
              <TextInput 
                label="Amount" 
                type="number" 
                leftSection={<IconCurrencyDollar size={16} />} 
                required 
                value={txForm.amount} 
                onChange={(e) => setTxForm({...txForm, amount: e.target.value})} 
              />
              <Select 
                label="Type" 
                data={[{value: 'expense', label: 'Expense'}, {value: 'income', label: 'Income'}]} 
                leftSection={txForm.transaction_type === 'income' ? <IconPlus size={16} /> : <IconMinus size={16} />}
                value={txForm.transaction_type} 
                onChange={(v) => setTxForm({...txForm, transaction_type: v})} 
              />
              <DateTimePicker label="Date" required value={txForm.transaction_date} onChange={(v) => setTxForm({...txForm, transaction_date: v})} />
              <Textarea label="Notes" value={txForm.notes} onChange={(e) => setTxForm({...txForm, notes: e.target.value})} />
              <Button fullWidth mt="md" loading={submitting} onClick={saveTransaction}>Save Transaction</Button>
            </>
          ) : (
            <>
              <TextInput label="Title" required value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} />
              <Select 
                label="Event Type" 
                value={eventForm.eventType} 
                leftSection={getEventTypeIcon(eventForm.eventType)}
                onChange={(v) => setEventForm({...eventForm, eventType: v})}
                data={[
                  { value: 'generic', label: 'Generic Event' },
                  { value: 'medical', label: 'Medical Event' },
                  { value: 'work', label: 'Work Event' },
                  { value: 'financial', label: 'Financial Event' },
                ]} 
              />
              
              {eventForm.eventType === 'medical' && (
                <Box p="sm" bg="gray.1" style={{borderRadius: 8}}>
                    <TextInput 
                        label="Reason" 
                        required 
                        mb="xs" 
                        leftSection={<IconStethoscope size={16} />}
                        value={eventForm.medicalReason} 
                        onChange={(e) => setEventForm({...eventForm, medicalReason: e.target.value})} 
                    />
                    <Group grow>
                        <TextInput 
                            label="Provider" 
                            leftSection={<IconUser size={16} />}
                            value={eventForm.medicalProvider} 
                            onChange={(e) => setEventForm({...eventForm, medicalProvider: e.target.value})} 
                        />
                        <TextInput 
                            label="Medication" 
                            leftSection={<IconPill size={16} />}
                            value={eventForm.medicalMedication} 
                            onChange={(e) => setEventForm({...eventForm, medicalMedication: e.target.value})} 
                        />
                    </Group>
                </Box>
              )}

              {eventForm.eventType === 'work' && (
                <Box p="sm" bg="gray.1" style={{borderRadius: 8}}>
                    <TextInput 
                        label="Description / Reason" 
                        placeholder="e.g. Weekly Meeting" 
                        required 
                        mb="xs" 
                        leftSection={<IconBriefcase size={16} />}
                        value={eventForm.workOccurrence} 
                        onChange={(e) => setEventForm({...eventForm, workOccurrence: e.target.value})} 
                    />
                    <TextInput 
                        label="Location" 
                        leftSection={<IconMapPin size={16} />}
                        value={eventForm.workLocation} 
                        onChange={(e) => setEventForm({...eventForm, workLocation: e.target.value})} 
                    />
                </Box>
              )}

              {eventForm.eventType === 'financial' && (
                 <Box p="sm" bg="gray.1" style={{borderRadius: 8}}>
                    <TextInput 
                        label="Description / Reason" 
                        placeholder="e.g. Monthly Rent" 
                        required 
                        mb="xs" 
                        leftSection={<IconBriefcase size={16} />}
                        value={eventForm.financeOccurrence} 
                        onChange={(e) => setEventForm({...eventForm, financeOccurrence: e.target.value})} 
                    />
                    <Group grow>
                        <TextInput 
                            label="Expected Amount" 
                            type="number" 
                            leftSection={<IconCurrencyDollar size={16} />}
                            value={eventForm.financeAmount} 
                            onChange={(e) => setEventForm({...eventForm, financeAmount: e.target.value})} 
                        />
                        <Select 
                            label="Recurring?" 
                            value={eventForm.financeRecurring ? "yes" : "no"} 
                            onChange={(v) => setEventForm({...eventForm, financeRecurring: v === "yes"})}
                            data={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} 
                        />
                    </Group>
                </Box>
              )}

              <DateTimePicker label="Event Date" required value={eventForm.set_date} onChange={(v) => setEventForm({...eventForm, set_date: v})} />
              <Textarea label="Notes" value={eventForm.notes} onChange={(e) => setEventForm({...eventForm, notes: e.target.value})} />
              <Button fullWidth mt="md" loading={submitting} onClick={saveEvent}>Save Event</Button>
            </>
          )}
        </Stack>
      </Modal>
    </AppShell>
  );
}