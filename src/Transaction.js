import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Table, Input, Button, Select, DatePicker, Modal } from "antd";

const { RangePicker } = DatePicker;
const API_URL = "https://kallpadmin.vercel.app/api";

export default function TransactionsDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);
  const [filters, setFilters] = useState({ action: "", category: "", description: "", code: "" });
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, pageSize: 10, current: 1 });
  const [mode, setMode] = useState("diario");

  useEffect(() => {
    fetchTransactions();
  }, [dateRange, filters, pagination.current]);

  async function fetchTransactions() {
    setLoading(true);
    const [startDate, endDate] = dateRange;
    const query = new URLSearchParams({
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
      clientId: 'KALLPAd5af0b3'
    });
    if (filters.action) query.append("action", filters.action);
    if (filters.category) query.append("type", filters.category);
    if (filters.description) query.append("description", filters.description);
    if (filters.code) query.append("code", filters.code);

    const response = await fetch(`${API_URL}/transactions?${query}`);
    const data = await response.json();
    setTransactions(data.data);
    setPagination((prev) => ({
        ...prev,
        total: data.pagination.totalItems,
        current: data.pagination.currentPage,
      }));
    setLoading(false);
  }

  function handleDelete(id) {
    Modal.confirm({
      title: "¿Estás seguro de eliminar esta transacción?",
      onOk: async () => {
        const response = await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
        if (response.ok) {
          fetchTransactions();
        } else {
          alert("Error al eliminar la transacción");
        }
      },
    });
  }

  function handleEdit(transaction) {
    setEditingTransaction(transaction);
    setModalVisible(true);
  }

  async function handleSave() {
    const { amount, action, type, description, date, _id } = editingTransaction;
    if (!amount || !action || !type || !description || !date) {
      alert("Por favor, llena todos los campos");
      return;
    }

    await fetch(`${API_URL}/transactions/${_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, action, type, description, date }),
    });

    setModalVisible(false);
    fetchTransactions();
  }

  function handleTableChange(page) {
    setPagination((prev) => ({ ...prev, current: page }));
  }

  function handleModeChange(value) {
    setMode(value);
    if (value === "diario") {
      setDateRange([dayjs().startOf("day"), dayjs().endOf("day")]);
    } else if (value === "monthly_custom") {
      setDateRange([dayjs().startOf("month"), dayjs().endOf("month")]);
    }
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Gestión de Transacciones</h2>
      <div className="flex gap-4 mb-4">
        <Select value={mode} onChange={handleModeChange}>
          <Select.Option value="diario">Diario</Select.Option>
          <Select.Option value="monthly_custom">Mensual</Select.Option>
        </Select>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="YYYY-MM-DD"
        />
        <Select
          value={filters.action}
          onChange={(value) => setFilters({ ...filters, action: value })}
          placeholder="Filtrar por acción"
          allowClear
        >
          <Select.Option value="INCOME">Ingreso</Select.Option>
          <Select.Option value="EXPENSE">Egreso</Select.Option>
        </Select>
        <Input
          placeholder="Filtrar por categoría"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <Input
          placeholder="Buscar por descripción"
          value={filters.description}
          onChange={(e) => setFilters({ ...filters, description: e.target.value })}
        />
        <Input
          placeholder="Buscar por código"
          value={filters.code}
          onChange={(e) => setFilters({ ...filters, code: e.target.value })}
        />
      </div>
      <Table
        dataSource={transactions}
        loading={loading}
        rowKey="_id"
        pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handleTableChange,
        }}
        columns={[
          { title: "Código", dataIndex: "code", key: "code"},
          { title: "Fecha", dataIndex: "date", key: "date" },
          { title: "Acción", dataIndex: "action", key: "action" },
          { title: "Categoría", dataIndex: "type", key: "type" },
          { title: "Monto", dataIndex: "amount", key: "amount" },
          { title: "Descripción", dataIndex: "description", key: "description" },
          {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (
              <>
                <Button onClick={() => handleEdit(record)}>Editar</Button>
                <Button danger onClick={() => handleDelete(record._id)}>Eliminar</Button>
              </>
            ),
          },
        ]}
      />
      <Modal
        title="Editar Transacción"
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <div className="space-y-4">
          <Input
            value={editingTransaction?.amount}
            onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: e.target.value })}
            disabled={true}
          />
          <Select
            value={editingTransaction?.action}
            onChange={(value) => setEditingTransaction({ ...editingTransaction, action: value })}
          >
            <Select.Option value="INCOME">Ingreso</Select.Option>
            <Select.Option value="EXPENSE">Egreso</Select.Option>
          </Select>
          <Input
            value={editingTransaction?.type}
            onChange={(e) => setEditingTransaction({ ...editingTransaction, type: e.target.value })}
          />
          <Input
            value={editingTransaction?.description}
            onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
          />
          <DatePicker
            value={editingTransaction?.date ? dayjs(editingTransaction.date) : null}
            disabled={true}
          />
        </div>
      </Modal>
    </div>
  );
}
