import { type StyleProp, type ViewStyle } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polyline,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import type { PersonalityType } from "../types";

interface Props {
  type: PersonalityType;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const PALETTE: Record<PersonalityType, { skin: string; main: string; accent: string; dark: string }> = {
  analyst:      { skin: "#FCD9B6", main: "#3B82F6", accent: "#22D3EE", dark: "#1E3A8A" },
  challenger:   { skin: "#FCD9B6", main: "#F97316", accent: "#EF4444", dark: "#7C2D12" },
  conservative: { skin: "#FCD9B6", main: "#22C55E", accent: "#10B981", dark: "#14532D" },
  emotional:    { skin: "#FCD9B6", main: "#A855F7", accent: "#EC4899", dark: "#581C87" },
  systematic:   { skin: "#FCD9B6", main: "#06B6D4", accent: "#14B8A6", dark: "#155E75" },
};

export default function PersonalityCharacter({ type, size = 140, style }: Props) {
  const c = PALETTE[type];
  return (
    <Svg viewBox="0 0 200 220" width={size} height={size * 1.1} style={style}>
      {/* glow halo */}
      <Defs>
        <RadialGradient id={`halo-${type}`} cx="50%" cy="55%" r="50%">
          <Stop offset="0%" stopColor={c.main} stopOpacity="0.45" />
          <Stop offset="100%" stopColor={c.main} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={`body-${type}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={c.main} />
          <Stop offset="100%" stopColor={c.dark} />
        </LinearGradient>
      </Defs>
      <Ellipse cx="100" cy="180" rx="85" ry="14" fill={c.main} opacity="0.18" />
      <Circle cx="100" cy="105" r="95" fill={`url(#halo-${type})`} />

      {/* body */}
      <Path
        d="M55 175 C 55 140, 80 130, 100 130 C 120 130, 145 140, 145 175 L 145 200 L 55 200 Z"
        fill={`url(#body-${type})`}
      />
      {/* neck */}
      <Rect x="92" y="118" width="16" height="18" rx="4" fill={c.skin} />

      {/* head */}
      <Circle cx="100" cy="90" r="42" fill={c.skin} />
      {/* hair (simple) */}
      <Path
        d="M58 88 C 58 60, 80 48, 100 48 C 122 48, 144 60, 144 88 C 138 76, 124 70, 110 72 C 104 66, 92 66, 84 72 C 72 72, 62 78, 58 88 Z"
        fill={c.dark}
      />

      {/* eyes (per type) */}
      {renderEyes(type, c)}
      {/* mouth (per type) */}
      {renderMouth(type, c)}
      {/* accessory (per type) */}
      {renderAccessory(type, c)}
    </Svg>
  );
}

function renderEyes(type: PersonalityType, c: { dark: string; accent: string }) {
  if (type === "analyst") {
    // glasses
    return (
      <G>
        <Circle cx="84" cy="92" r="10" fill="white" stroke={c.dark} strokeWidth="2.5" />
        <Circle cx="116" cy="92" r="10" fill="white" stroke={c.dark} strokeWidth="2.5" />
        <Line x1="94" y1="92" x2="106" y2="92" stroke={c.dark} strokeWidth="2.5" />
        <Circle cx="84" cy="93" r="3" fill={c.dark} />
        <Circle cx="116" cy="93" r="3" fill={c.dark} />
      </G>
    );
  }
  if (type === "challenger") {
    // determined eyes
    return (
      <G>
        <Path d="M76 88 L 92 92" stroke={c.dark} strokeWidth="3.5" strokeLinecap="round" />
        <Path d="M124 88 L 108 92" stroke={c.dark} strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="84" cy="95" r="3" fill={c.dark} />
        <Circle cx="116" cy="95" r="3" fill={c.dark} />
      </G>
    );
  }
  if (type === "conservative") {
    // calm small eyes
    return (
      <G>
        <Circle cx="84" cy="93" r="3" fill={c.dark} />
        <Circle cx="116" cy="93" r="3" fill={c.dark} />
      </G>
    );
  }
  if (type === "emotional") {
    // sparkly star eyes
    return (
      <G>
        <Circle cx="84" cy="93" r="4" fill={c.dark} />
        <Circle cx="116" cy="93" r="4" fill={c.dark} />
        <Circle cx="86" cy="91" r="1.4" fill="white" />
        <Circle cx="118" cy="91" r="1.4" fill="white" />
        <SvgText x="70" y="78" fontSize="12" fill={c.accent}>✦</SvgText>
        <SvgText x="124" y="78" fontSize="12" fill={c.accent}>✦</SvgText>
      </G>
    );
  }
  // systematic - closed zen eyes
  return (
    <G>
      <Path d="M76 94 Q 84 88 92 94" stroke={c.dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Path d="M108 94 Q 116 88 124 94" stroke={c.dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </G>
  );
}

function renderMouth(type: PersonalityType, c: { dark: string }) {
  if (type === "challenger") {
    return <Path d="M88 112 Q 100 122 112 112" stroke={c.dark} strokeWidth="3" fill="none" strokeLinecap="round" />;
  }
  if (type === "emotional") {
    return <Path d="M90 112 Q 100 120 110 112" stroke={c.dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  }
  if (type === "analyst") {
    return <Line x1="92" y1="112" x2="108" y2="112" stroke={c.dark} strokeWidth="2.5" strokeLinecap="round" />;
  }
  if (type === "conservative") {
    return <Path d="M92 110 Q 100 116 108 110" stroke={c.dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  }
  // systematic — small line
  return <Line x1="94" y1="113" x2="106" y2="113" stroke={c.dark} strokeWidth="2.5" strokeLinecap="round" />;
}

function renderAccessory(type: PersonalityType, c: { main: string; accent: string; dark: string }) {
  if (type === "analyst") {
    // chart on chest
    return (
      <G>
        <Rect x="78" y="155" width="44" height="28" rx="4" fill="white" opacity="0.95" />
        <Polyline points="82,178 92,168 102,172 112,160 118,164" fill="none" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    );
  }
  if (type === "challenger") {
    // raised fist (bolt) above head
    return (
      <G>
        <Path d="M150 50 L 138 78 L 150 78 L 142 100 L 168 70 L 156 70 L 164 50 Z" fill={c.accent} stroke={c.dark} strokeWidth="2" strokeLinejoin="round" />
      </G>
    );
  }
  if (type === "conservative") {
    // shield emblem
    return (
      <G>
        <Path d="M100 150 L 78 158 L 78 178 Q 78 192 100 198 Q 122 192 122 178 L 122 158 Z" fill="white" opacity="0.95" />
        <Path d="M100 158 L 86 164 L 86 178 Q 86 188 100 192 Q 114 188 114 178 L 114 164 Z" fill={c.main} />
        <Path d="M93 176 L 99 182 L 110 170" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    );
  }
  if (type === "emotional") {
    // floating sparkles around head
    return (
      <G>
        <SvgText x="40" y="60" fontSize="18" fill={c.accent}>✨</SvgText>
        <SvgText x="150" y="120" fontSize="16" fill={c.accent}>✨</SvgText>
        <SvgText x="36" y="140" fontSize="14" fill={c.accent}>✦</SvgText>
        <Path d="M85 158 Q 100 152 115 158 Q 110 170 100 172 Q 90 170 85 158 Z" fill={c.accent} opacity="0.9" />
      </G>
    );
  }
  // systematic — lotus / zen ring
  return (
    <G>
      <Circle cx="100" cy="40" r="14" fill="none" stroke={c.accent} strokeWidth="3" strokeDasharray="3 3" />
      <Circle cx="100" cy="170" r="10" fill={c.accent} opacity="0.85" />
      <Path d="M88 170 Q 100 158 112 170" stroke="white" strokeWidth="2.5" fill="none" />
    </G>
  );
}
