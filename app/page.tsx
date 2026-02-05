export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>TCG One Piece API</h1>
      <p>Welcome to the TCG One Piece API server.</p>
      <ul>
        <li>
          <a href="/api/documentation">API Documentation</a>
        </li>
        <li>
          <code>GET /api/cards</code> — List cards (requires auth)
        </li>
        <li>
          <code>GET /api/cards/:id</code> — Get card by ID (requires auth)
        </li>
        <li>
          <code>POST /api/pubsub/broadcast</code> — Broadcast cards (requires
          broadcaster auth)
        </li>
      </ul>
    </main>
  );
}
