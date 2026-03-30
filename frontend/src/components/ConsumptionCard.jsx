export default function ConsumptionCard({ device, watts }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      margin: "10px",
      borderRadius: "8px"
    }}>
      <h3>{device}</h3>
      <p>{watts} W</p>
    </div>
  );
}