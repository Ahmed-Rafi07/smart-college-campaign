import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#ef4444"]; // green, red

const AttendancePieChart = ({ attendance }) => {
  // Handle undefined or null attendance
  if (!attendance || typeof attendance !== 'object') {
    return (
      <div className="bg-white rounded-xl shadow p-6 h-full">
        <h3 className="font-semibold mb-4">🥧 Overall Attendance</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <p className="text-gray-400 text-sm">Loading chart...</p>
        </div>
      </div>
    );
  }

  let totalPresent = 0;
  let totalAbsent = 0;

  Object.values(attendance).forEach((s) => {
    totalPresent += s.present;
    totalAbsent += s.total - s.present;
  });

  const data = [
    { name: "Present", value: totalPresent },
    { name: "Absent", value: totalAbsent },
  ];

  if (totalPresent + totalAbsent === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 h-full">
        <h3 className="font-semibold mb-4">🥧 Overall Attendance</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <p className="text-gray-500 text-sm">No attendance data yet 📊</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 h-full" style={{ minHeight: 380 }}>
      <h3 className="font-semibold mb-4">🥧 Overall Attendance</h3>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendancePieChart;
