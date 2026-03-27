import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const sections = [
    {
      title: "1. Elegibilidad y Registro",
      content: "Para utilizar Regnum Casino, debes tener al menos 18 años de edad o la mayoría de edad legal en tu jurisdicción. El registro de múltiples cuentas por un solo usuario está estrictamente prohibido y resultará en la cancelación inmediata de todas las cuentas asociadas."
    },
    {
      title: "2. Verificación de Identidad (KYC)",
      content: "Nos reservamos el derecho de solicitar documentos de identificación en cualquier momento para verificar tu edad, identidad y origen de fondos. El incumplimiento de estas solicitudes puede llevar a la suspensión de la cuenta y la retención de fondos."
    },
    {
      title: "3. Depósitos y Retiros",
      content: "Todos los depósitos deben provenir de fuentes de pago a nombre del titular de la cuenta. Los retiros se procesarán utilizando el mismo método empleado para el depósito, siempre que sea posible, y están sujetos a límites diarios y mensuales de seguridad."
    },
    {
      title: "4. Juego Responsable",
      content: "Regnum Casino promueve el juego como una actividad de entretenimiento. Ofrecemos herramientas de autoexclusión, límites de depósito y límites de tiempo de sesión. El usuario es responsable de utilizar estas herramientas si siente que el juego está afectando su vida personal."
    },
    {
      title: "5. Juego Limpio y Prohibiciones",
      content: "Está prohibido el uso de software de asistencia, bots o cualquier forma de colusión entre jugadores. Cualquier actividad sospechosa de fraude o abuso de bonos resultará en la anulación de ganancias y el cierre permanente de la cuenta sin previo aviso."
    }
  ];

  return (
    <div className="page auth-page">
      <div className="bg-layer"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'linear-gradient(160deg, rgba(18, 38, 25, 0.98) 0%, rgba(13, 31, 24, 1) 100%)',
        border: '1px solid rgba(0, 245, 128, 0.15)',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 0 0 1px rgba(0, 245, 128, 0.05), 0 32px 80px rgba(0, 0, 0, 0.8)',
        maxWidth: '800px',
        margin: '40px 16px',
        width: '100%',
      }}>
        <Link href="/" className="link" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver al inicio
        </Link>

        <h1 className="logo-name" style={{ marginBottom: '32px', fontSize: '32px' }}>Términos de <span>Servicio</span></h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {sections.map((section, index) => (
            <section key={index}>
              <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>{section.title}</h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.7', fontSize: '15px' }}>{section.content}</p>
            </section>
          ))}
        </div>

        <footer style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
          Última actualización: Marzo 2026 | Regnum Casino © Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
