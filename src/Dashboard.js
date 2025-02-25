import { Bar } from "react-chartjs-2";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

const { RangePicker } = DatePicker;
const API_URL = "https://kallpadmin.vercel.app/api/transactions";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [balanceReport, setBalanceReport] = useState([]);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [dateRange, setDateRange] = useState([]);
  const [groupBy, setGroupBy] = useState("monthly_custom");

  const chartRef = useRef(null);

  useEffect(() => {
    updateDateRange(selectedYear, selectedMonth, groupBy);
  }, [selectedYear, selectedMonth, groupBy]);

  useEffect(() => {
    fetchData();
  }, [dateRange, groupBy]);

  const fetchData = async () => {
    if (!dateRange.length) return;

    const [startDate, endDate] = dateRange;
    console.log(API_URL)
    const response = await fetch(
      `${API_URL}?clientId=KALLPAd5af0b3&mode=report&startDate=${startDate.format("YYYY-MM-DD")}&endDate=${endDate.format("YYYY-MM-DD")}&balance=true&groupBy=${groupBy}`
    );
    const data = await response.json();

    const groupedData = data.report.reduce((acc, item) => {
      const period = item._id.period;
      const action = item._id.action;
      const amount = item.totalAmount;

      if (!acc[period]) {
        acc[period] = { income: 0, expense: 0 };
      }

      if (action === "INCOME") {
        acc[period].income += amount;
      } else if (action === "EXPENSE") {
        acc[period].expense += amount;
      }

      return acc;
    }, {});

    setTransactions(
      Object.entries(groupedData).map(([period, { income, expense }]) => ({
        period,
        income,
        expense,
      }))
    );

    setBalanceReport(
      data.balanceReport.map(({ period, income, expense, balance }) => ({
        period,
        income,
        expense,
        balance,
      }))
    );
  };

  const updateDateRange = (year, month, groupBy) => {
    let startDate, endDate;

    switch (groupBy) {
      case "daily":
        startDate = endDate = dayjs();
        break;
      case "weekly":
        startDate = dayjs().subtract(6, "day");
        endDate = dayjs();
        break;
      case "monthly":
        startDate = dayjs(`${year}-${month}-01`);
        endDate = startDate.endOf("month");
        break;
      case "monthly_custom":
        const startMonth = month === 1 ? 12 : month - 1;
        const startYear = month === 1 ? year - 1 : year;
        startDate = dayjs(`${startYear}-${startMonth}-15`);
        endDate = dayjs(`${year}-${month}-15`);
        break;
      case "yearly":
        startDate = dayjs(`${year}-01-01`);
        endDate = startDate.endOf("year");
        break;
      default:
        return;
    }
    setDateRange([startDate, endDate]);
  };

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = dayjs().year() - 5 + i;
    return { value: year, label: year };
  });

  const monthOptions = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Dashboard de Transacciones</h2>
      <div className="flex gap-4 mb-4">
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          options={yearOptions}
          placeholder="Seleccionar Año"
        />
        {groupBy !== "yearly" && groupBy !== "monthly" && (
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
            placeholder="Seleccionar Mes"
          />
        )}
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="YYYY-MM-DD"
        />
        <Select
          value={groupBy}
          onChange={(value) => setGroupBy(value)}
          options={[
            { value: "monthly_custom", label: "15 Mensual" },
            { value: "daily", label: "Diario" },
            { value: "weekly", label: "Semanal" },
            { value: "monthly", label: "Mensual" },
            { value: "yearly", label: "Anual" },
          ]}
        />
      </div>
      <h3 className="text-lg font-semibold mt-4">Balance</h3>
      <div>
        <Bar ref={chartRef} data={{ labels: balanceReport.map((b) => b.period), datasets: [{ label: "Balance", data: balanceReport.map((b) => b.balance), backgroundColor: "#2196F3" }] }} />
      </div>
      <h3 className="text-lg font-semibold mt-4">Ingresos vs Egresos</h3>
      <div>
        <Bar ref={chartRef} data={{ labels: transactions.map((t) => t.period), datasets: [{ label: "Ingresos", data: transactions.map((t) => t.income), backgroundColor: "#4CAF50" }, { label: "Egresos", data: transactions.map((t) => t.expense), backgroundColor: "#F44336" }] }} />
      </div>
    </div>
  );
}
