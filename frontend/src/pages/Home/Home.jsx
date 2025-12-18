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
    setModalType("event");
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

    // ---------- TRANSACTIONS STATE ----------
    const [transactions, setTransactions] = useState([]);
    const [transactionSortAsc, setTransactionSortAsc] = useState(true);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // transaction form
    const [transactionTitle, setTransactionTitle] = useState("");
    const [transactionNotes, setTransactionNotes] = useState("");
    const [transactionAmount, setTransactionAmount] = useState("");
    const [transactionType, setTransactionType] = useState("expense");
    const [transactionDate, setTransactionDate] = useState(null);

    // ---------- FETCH TRANSACTIONS ----------
    const fetchTransactions = async () => {
    const res = await api.get("/api/transactions/");
    setTransactions(res.data);
    };

    useEffect(() => {
    fetchTransactions();
    }, []);

    // ---------- SORT TRANSACTIONS ----------
    const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
        const d1 = new Date(a.transaction_date);
        const d2 = new Date(b.transaction_date);
        return transactionSortAsc ? d1 - d2 : d2 - d1;
    });
    }, [transactions, transactionSortAsc]);

    // ---------- TRANSACTION CREATE / EDIT ----------
    const openCreateTransaction = () => {
        setModalType("transaction");
        setEditingTransaction(null);
        setTransactionTitle("");
        setTransactionNotes("");
        setTransactionAmount("");
        setTransactionType("expense");
        setTransactionDate(null);
        setOpened(true);
      };
      
      const openEditTransaction = (tx) => {
        setModalType("transaction");
        setEditingTransaction(tx);
        setTransactionTitle(tx.title);
        setTransactionNotes(tx.notes || "");
        setTransactionAmount(tx.amount);
        setTransactionType(tx.transaction_type);
        setTransactionDate(dayjs(tx.transaction_date));
        setOpened(true);
      };

    const saveTransaction = async () => {
    if (!transactionTitle || !transactionDate || !transactionAmount) return;

    const payload = {
        title: transactionTitle,
        notes: transactionNotes,
        amount: transactionAmount,
        transaction_type: transactionType,
        transaction_date: dayjs(transactionDate).toISOString(),
    };

    if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction.id}/`, payload);
    } else {
        await api.post("/api/transactions/", payload);
    }

    setOpened(false);
    fetchTransactions();
    };

    // ---------- TRANSACTION DELETE ----------
    const deleteTransaction = async (id) => {
    await api.delete(`/api/transactions/${id}/`);
    fetchTransactions();
    };

    const [modalType, setModalType] = useState("event"); 

  return (
    
    <AppShell padding="md">
      {/* ---------- LOGOUT ---------- */}
      <Group justify="flex-end" mb="md">
        <Button variant="outline" color="red" onClick={handleLogout}>
            Logout
        </Button>
        </Group>
        {/* ---------- Transactions ---------- */}
        <Group justify="space-between" mb="md">
        <Title order={2}>Transactions</Title>

        <Group>
            <ActionIcon
            onClick={() => setTransactionSortAsc(!transactionSortAsc)}
            >
            {transactionSortAsc ? (
                <IconSortAscending />
            ) : (
                <IconSortDescending />
            )}
            </ActionIcon>

            <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateTransaction}
            >
            Add Transaction
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
            {sortedTransactions.map((tx) => (
                <Table.Tr
                key={tx.id}
                onClick={() => openEditTransaction(tx)}
                style={{ cursor: "pointer" }}
                >
                <Table.Td>{tx.title}</Table.Td>

                <Table.Td>
                    {dayjs(tx.transaction_date).format("MMM D, YYYY")}
                </Table.Td>

                <Table.Td>
                    <Button
                    size="xs"
                    color="red"
                    variant="subtle"
                    onClick={(ev) => {
                        ev.stopPropagation();
                        deleteTransaction(tx.id);
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

        {/* ---------- Upcoming Events ---------- */}
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
  title={modalType === "transaction" ? "Transaction" : "Event"}
>
  <Stack>
    {/* ---------- TITLE ---------- */}
    <TextInput
      label="Title"
      value={modalType === "transaction" ? transactionTitle : title}
      onChange={(e) =>
        modalType === "transaction"
          ? setTransactionTitle(e.target.value)
          : setTitle(e.target.value)
      }
      required
    />

    {/* ---------- NOTES ---------- */}
    <Textarea
      label="Notes"
      value={modalType === "transaction" ? transactionNotes : notes}
      onChange={(e) =>
        modalType === "transaction"
          ? setTransactionNotes(e.target.value)
          : setNotes(e.target.value)
      }
    />

    {/* ---------- TRANSACTION-ONLY ---------- */}
        {modalType === "transaction" && (
        <>
            <TextInput
            label="Amount"
            type="number"
            value={transactionAmount}
            onChange={(e) => setTransactionAmount(e.target.value)}
            required
            />

            <Select
            label="Type"
            value={transactionType}
            onChange={setTransactionType}
            data={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" },
            ]}
            />

            <DateTimePicker
            label="Transaction Date"
            value={transactionDate}
            onChange={setTransactionDate}
            required
            />
        </>
        )}

        {/* ---------- EVENT-ONLY ---------- */}
        {modalType === "event" && (
        <DateTimePicker
            label="Event Date"
            value={setDate}
            onChange={setSetDate}
            required
        />
        )}

        {/* ---------- SAVE ---------- */}
        <Button
        onClick={modalType === "transaction" ? saveTransaction : saveEvent}
        >
        Save
        </Button>
    </Stack>
    </Modal>

    </AppShell>
  );
}
