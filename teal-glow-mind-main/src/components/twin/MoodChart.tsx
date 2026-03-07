import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", mood: 6, phq: 8 },
  { day: "Tue", mood: 5, phq: 10 },
  { day: "Wed", mood: 4, phq: 12 },
  { day: "Thu", mood: 5, phq: 11 },
  { day: "Fri", mood: 7, phq: 8 },
  { day: "Sat", mood: 6, phq: 9 },
  { day: "Sun", mood: 7, phq: 7 },
];

const MoodChart = () => (
  <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
    <h3 className="text-sm font-display font-semibold text-foreground mb-5">Mood Trend (7 Days)</h3>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
        <XAxis dataKey="day" stroke="hsl(220 10% 46%)" fontSize={12} fontFamily="'Inter'" />
        <YAxis stroke="hsl(220 10% 46%)" fontSize={12} fontFamily="'Inter'" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(0 0% 100%)",
            border: "1px solid hsl(220 13% 91%)",
            borderRadius: "8px",
            color: "hsl(220 20% 10%)",
            fontFamily: "'Inter'",
            fontSize: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
          }}
        />
        <Line type="monotone" dataKey="mood" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={{ fill: "hsl(160 84% 39%)", r: 4 }} name="Mood" />
        <Line type="monotone" dataKey="phq" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ fill: "hsl(38 92% 50%)", r: 4 }} name="PHQ Score" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default MoodChart;
