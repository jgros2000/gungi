const PIECES = ["K", "Q", "R", "B", "N", "P"];
const PIECE_NAMES = { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn" };

function PiecePicker({ onSelect, onCancel }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 10,
      borderRadius: 12,
    }}>
      <div style={{
        background: "white", borderRadius: 12, padding: "20px 24px",
        border: "0.5px solid #ddd", minWidth: 260,
      }}>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 14, fontWeight: 500 }}>
          Choose a piece to place
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {PIECES.map((p) => (
            <button key={p} onClick={() => onSelect(p)} style={{
              padding: "10px 0", borderRadius: 8, border: "0.5px solid #ccc",
              background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}>
              {p}
              <span style={{ display: "block", fontSize: 10, color: "#888", fontWeight: 400 }}>
                {PIECE_NAMES[p]}
              </span>
            </button>
          ))}
        </div>
        <button onClick={onCancel} style={{
          marginTop: 12, width: "100%", padding: "8px 0", borderRadius: 8,
          border: "0.5px solid #ccc", background: "transparent", cursor: "pointer", fontSize: 13, color: "#888",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PiecePicker;