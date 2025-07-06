// ForecastChart.js
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ForecastChart({ forecast }) {
  const labels = forecast.map((item) =>
    new Date(item.dt_txt).toLocaleDateString(undefined, {
      weekday: "short",
    })
  );

  const temperatures = forecast.map((item) => item.main.temp);

  const data = {
    labels,
    datasets: [
      {
        label: "Temp (°C)",
        data: temperatures,
        fill: false,
        borderColor: "#007bff",
        backgroundColor: "#007bff",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="chart-container">
      <h3>📈 Temperature Chart</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export default ForecastChart;
