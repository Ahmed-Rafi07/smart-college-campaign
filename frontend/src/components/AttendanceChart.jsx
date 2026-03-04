import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const AttendanceChart = ({ subjects, attendance }) => {
  // Handle loading state
  if (!subjects || !attendance) {
    return (
      <div className="bg-white rounded-xl shadow p-6 h-full">
        <h3 className="font-semibold mb-4">📊 Attendance Overview</h3>
        <div style={{ width: '100%', height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-gray-400 text-sm">Loading chart...</p>
        </div>
      </div>
    );
  }

  const data = subjects.map((sub) => {
    const stats = attendance[sub._id] || { total: 0, present: 0 };
    const percent =
      stats.total === 0 ? 0 : Math.round((stats.present / stats.total) * 100);

    return {
      name: sub.name,
      percent,
    };
  });

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 h-full">
        <h3 className="font-semibold mb-4">📊 Attendance Overview</h3>
        <div style={{ width: '100%', height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-gray-500 text-sm">No attendance data yet 📊</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 h-full" style={{ minHeight: 340 }}>
      <h3 className="font-semibold mb-4">📊 Attendance Overview</h3>

      <div style={{ width: '100%', height: 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="percent" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
