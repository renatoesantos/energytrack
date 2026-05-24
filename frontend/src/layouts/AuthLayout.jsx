export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>EnergyTrack ⚡</h1>
        <p>Monitore e otimize seu consumo de energia em tempo real</p>
      </div>

      <div className="auth-right">
        {children}
      </div>
    </div>
  );
}