import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppShell, Button, Group, Title, Table, Paper, TextInput, 
  Textarea, Select, Stack, Modal, ActionIcon, Divider, Center, 
  Loader, Grid, Badge, ScrollArea, Container, Text, Box, ThemeIcon, Tooltip
} from "@mantine/core";
import { DateTimePicker, Calendar } from "@mantine/dates";
import { 
  IconPlus, IconSortAscending, IconSortDescending, IconTrash, IconLogout, 
  IconMinus, IconStethoscope, IconBriefcase, IconCash, IconCalendarEvent,
  IconMapPin, IconPill, IconCurrencyDollar, IconRepeat, IconUser,
  IconTrendingUp, IconTrendingDown, IconLink, IconFolderPlus
} from "@tabler/icons-react";
import dayjs from "dayjs";
import api from "../../api/client";

// --- INITIAL STATES ---
const INITIAL_EVENT_STATE = {
  title: "", notes: "", set_date: null, eventType: "generic",
  medicalReason: "", medicalProvider: "", medicalMedication: "",
  workOccurrence: "", workLocation: "",
  financeOccurrence: "", financeAmount: "", financeRecurring: false,
  series: null,
};

const INITIAL_TX_STATE = {
  title: "", notes: "", amount: "", transaction_type: "expense", transaction_date: null
};

// --- COLORS FOR SERIES HIGHLIGHTING ---
const SERIES_COLORS = [
    'violet', 'cyan', 'lime', 'pink', 'orange', 'indigo', 'teal', 'grape'
];

export default function Home() {
  const navigate = useNavigate();

  // --- Data State ---
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [seriesList, setSeriesList] = useState([]); // Stores the list of series
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- UI State ---
  const [opened, setOpened] = useState(false);
  const [modalType, setModalType] = useState("event"); // "event" | "transaction" | "series"
  const [editingId, setEditingId] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [txSortAsc, setTxSortAsc] = useState(true);

  // --- Form States ---
  const [eventForm, setEventForm] = useState(INITIAL_EVENT_STATE);
  const [txForm, setTxForm] = useState(INITIAL_TX_STATE);
  const [seriesName, setSeriesName] = useState(""); // State for the new Series Form

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, txRes, seriesRes] = await Promise.all([
        api.get("/api/events/"),
        api.get("/api/transactions/"),
        api.get("/api/event-series/")
      ]);
      setEvents(eventsRes.data);
      setTransactions(txRes.data);
      setSeriesList(seriesRes.data);
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
    setSeriesName("");
  };

  // --- Helper: Get Series Color ---
  const getSeriesColor = (seriesId) => {
    if (!seriesId) return null;
    return SERIES_COLORS[seriesId % SERIES_COLORS.length];
  };

  // --- Helper: Detect Event Type & Color ---
    const getEventMeta = (event) => {
        let meta = { type: 'generic', icon: <IconCalendarEvent size={16} />, color: 'gray', label: 'Generic' };
        
        // 1. Determine Type based on the nested data from backend
        if (event.medical_data || "reason" in event) {
            meta = { type: 'medical', icon: <IconStethoscope size={16} />, color: 'red', label: 'Medical' };
        } else if (event.financial_data || "expected_amount" in event) {
            meta = { type: 'financial', icon: <IconCash size={16} />, color: 'teal', label: 'Financial' };
        } else if (event.work_data || "location" in event) {
            meta = { type: 'work', icon: <IconBriefcase size={16} />, color: 'blue', label: 'Work' };
        }

        // 2. OVERRIDE Color if it belongs to a Series
        if (event.series) {
            meta.color = getSeriesColor(event.series);
            meta.isSeries = true;
        }

        return meta;
    };

  // --- Handlers ---
  const openCreateEvent = () => {
    setModalType("event");
    setEditingId(null);
    setEventForm(INITIAL_EVENT_STATE);
    setOpened(true);
  };

  const openCreateSeries = () => {
    setModalType("series");
    setSeriesName("");
    setOpened(true);
  };

  const openEditEvent = (event) => {
    setModalType("event");
    setEditingId(event.id);
    
    const { type } = getEventMeta(event);
    
    // Helper to safely get nested data or fallback to top-level (for specific endpoints)
    const med = event.medical_data || event;
    const work = event.work_data || event;
    const fin = event.financial_data || event;

    setEventForm({
      title: event.title,
      notes: event.notes || "",
      set_date: new Date(event.set_date),
      eventType: type,
      
      // Load Medical Data
      medicalReason: med.reason || "",
      medicalProvider: med.provider || "",
      medicalMedication: med.medication || "",
      
      // Load Work Data
      workOccurrence: work.occurrence || "",
      workLocation: work.location || "",
      
      // Load Finance Data
      financeOccurrence: fin.occurrence || "",
      financeAmount: fin.expected_amount || "",
      financeRecurring: fin.is_recurring || false,
      
      series: event.series, 
    });
    setOpened(true);
  };

  const saveEvent = async () => {
    setSubmitting(true);
    const basePayload = {
      title: eventForm.title,
      notes: eventForm.notes,
      set_date: dayjs(eventForm.set_date).toISOString(),
      series: eventForm.series || null, 
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

  // --- NEW: SAVE SERIES ---
  const saveSeries = async () => {
      setSubmitting(true);
      try {
          await api.post("/api/event-series/", { name: seriesName });
          fetchData(); // Refresh list so it shows in dropdown immediately
          closeModal();
      } catch (err) {
          console.error("Failed to create series", err);
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

  const getEventTypeIconForModal = (type) => {
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

        <Grid gutter="xl">
          {/* --- TRANSACTIONS --- */}
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
                                <ThemeIcon size="sm" radius="xl" color={tx.transaction_type === "expense" ? "red" : "green"} variant="light">
                                    {tx.transaction_type === "expense" ? <IconTrendingDown size={14} /> : <IconTrendingUp size={14} />}
                                </ThemeIcon>
                                <Text fw={500}>{tx.title}</Text>
                            </Group>
                        </Table.Td>
                        <Table.Td c="dimmed">{dayjs(tx.transaction_date).format("MMM D")}</Table.Td>
                        <Table.Td>
                            <Badge color={tx.transaction_type === "expense" ? "red" : "green"} variant="light">
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

          {/* --- EVENTS --- */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="md" radius="lg" p="xl" withBorder h="100%">
              <Group justify="space-between" mb="lg">
                <Title order={3}>Events</Title>
                <Group gap="xs">
                  <ActionIcon variant="light" color="gray" onClick={() => setSortAsc(!sortAsc)}>
                    {sortAsc ? <IconSortAscending size={18} /> : <IconSortDescending size={18} />}
                  </ActionIcon>
                  {/* --- NEW BUTTON: CREATE SERIES --- */}
                  <Button size="xs" variant="light" leftSection={<IconFolderPlus size={14} />} onClick={openCreateSeries}>
                    Series
                  </Button>
                  <Button size="xs" leftSection={<IconPlus size={14} />} onClick={openCreateEvent}>
                    Add Event
                  </Button>
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
                      const showSeriesIcon = meta.isSeries; 
                      
                      return (
                        <Table.Tr key={e.id} onClick={() => openEditEvent(e)} style={{ cursor: "pointer" }}>
                          <Table.Td>
                            <Group gap="xs">
                                <Tooltip label={showSeriesIcon ? "Part of a Series" : meta.label} withArrow position="top-start">
                                    <ThemeIcon size="sm" radius="xl" color={meta.color} variant={showSeriesIcon ? "filled" : "light"}>
                                        {meta.icon}
                                    </ThemeIcon>
                                </Tooltip>
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

          {/* --- CALENDAR --- */}
          <Grid.Col span={12}>
            <Paper shadow="md" radius="lg" p="xl" withBorder mt="md">
                <Stack align="center">
                    <Title order={3} mb="md">Calendar Overview</Title>
                    <Calendar
                        size="xl" 
                        renderDay={(date) => {
                            const daysEvents = events.filter(e => dayjs(e.set_date).isSame(dayjs(date), 'day'));
                            const hasEvent = daysEvents.length > 0;
                            
                            // Color logic for calendar dots
                            let dayColor = "#228be6";
                            if (hasEvent && daysEvents[0].series) {
                                // Use the series color for the calendar dot if possible
                                const colorName = getSeriesColor(daysEvents[0].series);
                                // Simple mapping for standard mantine colors to Hex for the calendar
                                const colorMap = { violet: '#7950f2', cyan: '#15aabf', lime: '#82c91e', pink: '#be4bdb', orange: '#fd7e14', indigo: '#4c6ef5', teal: '#12b886', grape: '#be4bdb' };
                                if(colorMap[colorName]) dayColor = colorMap[colorName];
                            }

                            return (
                            <div style={{ 
                                width: 40, height: 40, 
                                borderRadius: "8px", 
                                backgroundColor: hasEvent ? dayColor : "transparent",
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
      <Modal opened={opened} onClose={closeModal} title={modalType === 'series' ? "Create New Series" : (editingId ? "Edit Item" : "Create New")} size="lg" radius="md">
        <Stack>
          
          {/* 1. TRANSACTION FORM */}
          {modalType === "transaction" && (
            <>
              <TextInput label="Title" required value={txForm.title} onChange={(e) => setTxForm({...txForm, title: e.target.value})} />
              <TextInput label="Amount" type="number" leftSection={<IconCurrencyDollar size={16} />} required value={txForm.amount} onChange={(e) => setTxForm({...txForm, amount: e.target.value})} />
              <Select label="Type" data={[{value: 'expense', label: 'Expense'}, {value: 'income', label: 'Income'}]} leftSection={txForm.transaction_type === 'income' ? <IconPlus size={16} /> : <IconMinus size={16} />} value={txForm.transaction_type} onChange={(v) => setTxForm({...txForm, transaction_type: v})} />
              <DateTimePicker label="Date" required value={txForm.transaction_date} onChange={(v) => setTxForm({...txForm, transaction_date: v})} />
              <Textarea label="Notes" value={txForm.notes} onChange={(e) => setTxForm({...txForm, notes: e.target.value})} />
              <Button fullWidth mt="md" loading={submitting} onClick={saveTransaction}>Save Transaction</Button>
            </>
          )}

          {/* 2. EVENT FORM */}
          {modalType === "event" && (
            <>
              <TextInput label="Title" required value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} />
              <Select 
                label="Event Type" 
                value={eventForm.eventType} 
                leftSection={getEventTypeIconForModal(eventForm.eventType)}
                onChange={(v) => setEventForm({...eventForm, eventType: v})}
                
                // --- THE FIX ---
                // Ensure this is ONLY disabled if editingId has a value (Editing mode)
                // If editingId is null (Creation mode), this will be false (Enabled)
                disabled={editingId !== null}
                
                data={[
                    { value: 'generic', label: 'Generic Event' },
                    { value: 'medical', label: 'Medical Event' },
                    { value: 'work', label: 'Work Event' },
                    { value: 'financial', label: 'Financial Event' },
                ]} 
                />
              
              {eventForm.eventType === 'medical' && (
                <Box p="sm" bg="gray.1" style={{borderRadius: 8}}>
                    <TextInput label="Reason" required mb="xs" leftSection={<IconStethoscope size={16} />} value={eventForm.medicalReason} onChange={(e) => setEventForm({...eventForm, medicalReason: e.target.value})} />
                    <Group grow>
                        <TextInput label="Provider" leftSection={<IconUser size={16} />} value={eventForm.medicalProvider} onChange={(e) => setEventForm({...eventForm, medicalProvider: e.target.value})} />
                        <TextInput label="Medication" leftSection={<IconPill size={16} />} value={eventForm.medicalMedication} onChange={(e) => setEventForm({...eventForm, medicalMedication: e.target.value})} />
                    </Group>
                </Box>
              )}

              {eventForm.eventType === 'work' && (
                <Box p="sm" bg="gray.1" style={{borderRadius: 8}}>
                    <TextInput label="Description / Reason" placeholder="e.g. Weekly Meeting" required mb="xs" leftSection={<IconBriefcase size={16} />} value={eventForm.workOccurrence} onChange={(e) => setEventForm({...eventForm, workOccurrence: e.target.value})} />
                    <TextInput label="Location" leftSection={<IconMapPin size={16} />} value={eventForm.workLocation} onChange={(e) => setEventForm({...eventForm, workLocation: e.target.value})} />
                </Box>
              )}

              {eventForm.eventType === 'financial' && (
                 <Box p="sm" bg="gray.1" style={{borderRadius: 8}}>
                    <TextInput label="Description / Reason" placeholder="e.g. Monthly Rent" required mb="xs" leftSection={<IconRepeat size={16} />} value={eventForm.financeOccurrence} onChange={(e) => setEventForm({...eventForm, financeOccurrence: e.target.value})} />
                    <Group grow>
                        <TextInput label="Expected Amount" type="number" leftSection={<IconCurrencyDollar size={16} />} value={eventForm.financeAmount} onChange={(e) => setEventForm({...eventForm, financeAmount: e.target.value})} />
                        <Select label="Recurring?" value={eventForm.financeRecurring ? "yes" : "no"} onChange={(v) => setEventForm({...eventForm, financeRecurring: v === "yes"})} data={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
                    </Group>
                </Box>
              )}

              <DateTimePicker label="Event Date" required value={eventForm.set_date} onChange={(v) => setEventForm({...eventForm, set_date: v})} />
              <Textarea label="Notes" value={eventForm.notes} onChange={(e) => setEventForm({...eventForm, notes: e.target.value})} />
              
              <Select
                label="Link to Series (Optional)"
                placeholder="Select a series or create new one via dashboard"
                clearable
                searchable
                leftSection={<IconLink size={16} />}
                value={eventForm.series ? String(eventForm.series) : null}
                onChange={(value) => setEventForm({ ...eventForm, series: value })}
                data={seriesList.map((s) => ({ value: String(s.id), label: s.name }))}
              />
              <Text size="xs" c="dimmed">
                  Tip: To create a new series (like "Gym" or "Therapy"), close this and click the "Series" button on the dashboard.
              </Text>

              <Divider my="sm" />
              <Button fullWidth mt="md" loading={submitting} onClick={saveEvent}>Save Event</Button>
            </>
          )}

          {/* 3. NEW: SERIES CREATION FORM */}
          {modalType === "series" && (
              <>
                <TextInput 
                    label="Series Name" 
                    placeholder="e.g. Bi-Weekly Therapy, Gym, Rent" 
                    required 
                    value={seriesName} 
                    onChange={(e) => setSeriesName(e.target.value)} 
                />
                <Button fullWidth mt="md" loading={submitting} onClick={saveSeries}>Create Series</Button>
              </>
          )}

        </Stack>
      </Modal>
    </AppShell>
  );
}