import classNames from "classnames";
import Color from "color";

const computeColorFromString = (str: string) => {
  const hash = Array.from(str).reduce(
    (hash, char) => 0 | (31 * hash + char.charCodeAt(0)),
    0
  );
  // Keep any auto-generated tag color inside the blue family (roughly
  // cyan -> indigo, hue 185-255) so unmapped/dynamic tags never clash
  // with the rest of the blue-scale palette. Saturation/lightness still
  // vary a bit so tags stay visually distinguishable from one another.
  const hue = 185 + (Math.abs(hash) % 70);
  const saturation = 55 + (Math.abs(hash >> 3) % 35);
  const lightness = 30 + (Math.abs(hash >> 6) % 25);
  return Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`).hex();
};

// Hardcode colors here
const tagColorMap: Record<string, string> = {
  fishy: "rgb(191, 219, 254)",
  // All 10 tags on one blue scale, darkest to brightest (defensive/blue-team feel)
  tcp: "#172554",
  udp: "#1e3a8a",
  http: "#1e40af",
  "flag-in": "#1d4ed8",
  "flagid-in": "#1a49c4",
  "flagid-out": "#2563eb",
  "flag-out": "#3b82f6",
  blocked: "#0369a1",
  suricata: "#0284c7",
  starred: "#0ea5e9",
  enemy: "#312e81",
};

export function tagToColor(tag: string) {
  return tagColorMap[tag] ?? computeColorFromString(tag);
}
interface TagProps {
  tag: string;
  color?: string;
  disabled?: boolean;
  excluded?: boolean;
  onClick?: () => void;
}
export const Tag = ({ tag, color, disabled = false, excluded = false, onClick }: TagProps) => {
  var tagBackgroundColor = disabled ? "#404040" : color ?? tagToColor(tag);

  var tagTextColor = disabled
    ? "#a3a3a3"
    : Color(tagBackgroundColor).isDark()
      ? "#fff"
      : "#000";


  if (excluded) {
    tagTextColor = "white";
    tagBackgroundColor = "black";
  }
  return (
    <div
      onClick={onClick}
      className={classNames("p-3 cursor-pointer rounded-md uppercase text-xs h-5 text-center flex items-center hover:opacity-90 transition-colors duration-250 text-ellipsis overflow-hidden whitespace-nowrap", {
        "bg-neutral-700": disabled,
      })}
      style={{
        backgroundColor: tagBackgroundColor,
        color: tagTextColor,
      }}
    >
      <span  style={excluded ? { textDecoration: 'line-through' } : {}}>{tag}</span>
    </div>
  );
};
