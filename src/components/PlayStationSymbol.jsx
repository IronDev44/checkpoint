import "./PlayStationSymbol.css";
const symbols = [
  ["M12 3 L22 21 H2 Z", "#5eead4"],
  ["M21 12 A9 9 0 1 1 3 12 A9 9 0 1 1 21 12", "#fb7185"],
  ["M5 5 L19 19 M19 5 L5 19", "#93c5fd"],
  ["M4 4 H20 V20 H4 Z", "#f0abfc"],
];
export default function PlayStationSymbol({ index = 0 }) {
  const [path, color] = symbols[index % symbols.length];
  return <svg className="playstation-symbol" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}
