import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
export type IconName = React.ComponentProps<typeof Feather>["name"];
export const C = {
  ink: "#17231D",
  muted: "#617067",
  green: "#19583C",
  pale: "#EAF3ED",
  line: "#DCE3DE",
  paper: "#F6F7F4",
  gold: "#9A6D2F",
};
export const Icon = ({
  name,
  size = 19,
  color = C.green,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) => <Feather name={name} size={size} color={color} />;
export function Button({
  label,
  onPress,
  icon,
  secondary = false,
  disabled = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary ? s.secondary : s.primary,
        danger && { backgroundColor: "#FAECE8" },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}
    >
      <Text
        numberOfLines={2}
        style={[
          s.buttonLabel,
          { color: danger ? "#914f38" : secondary ? C.green : "#fff" },
        ]}
      >
        {label}
      </Text>
      {icon && (
        <Icon
          name={icon}
          size={17}
          color={danger ? "#914f38" : secondary ? C.green : "#fff"}
        />
      )}
    </Pressable>
  );
}
export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        active && s.chipActive,
        pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
      ]}
    >
      {icon && <Icon name={icon} size={15} color={active ? "#fff" : C.muted} />}
      <Text style={[s.chipText, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 8, marginBottom: 18 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#89958D"
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          s.input,
          focused && s.inputFocused,
          multiline && { minHeight: 90, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => <View style={[s.card, style]}>{children}</View>;
export function PageIntro({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: IconName;
}) {
  const compact = useWindowDimensions().width < 980;
  return (
    <View style={[s.pageIntro, { padding: compact ? 22 : 30 }]}>
      <View style={s.introIcon}>
        <Icon name={icon} color="#D7E8D9" size={22} />
      </View>
      <Text
        style={[
          s.heading,
          s.introTitle,
          compact && { fontSize: 30, lineHeight: 37 },
        ]}
      >
        {title}
      </Text>
      <Text style={[s.body, s.introBody]}>{text}</Text>
    </View>
  );
}
export function Note({
  title,
  text,
  icon = "info",
}: {
  title: string;
  text: string;
  icon?: IconName;
}) {
  return (
    <View style={s.note}>
      <Icon name={icon} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.bold}>{title}</Text>
        <Text style={s.small}>{text}</Text>
      </View>
    </View>
  );
}
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name="inbox" size={30} />
      </View>
      <Text style={s.h2}>{title}</Text>
      <Text style={[s.body, { textAlign: "center", maxWidth: 400 }]}>
        {text}
      </Text>
      {action}
    </View>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minWidth: 0,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  sidebar: {
    width: 250,
    backgroundColor: "#FCFDFB",
    borderRightWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 22,
    paddingVertical: 26,
    gap: 7,
  },
  brand: {
    fontSize: 24,
    letterSpacing: -1.25,
    fontWeight: "800",
    color: C.ink,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.45,
    color: C.muted,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 13,
  },
  navActive: {
    backgroundColor: C.pale,
    borderWidth: 1,
    borderColor: "#D6E6DB",
    borderLeftWidth: 4,
    borderLeftColor: C.green,
  },
  navText: { fontSize: 14, color: C.muted, fontWeight: "600", flexShrink: 1 },
  content: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingBottom: 40,
  },
  topbar: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: C.line,
    marginBottom: 28,
  },
  heading: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "700",
    letterSpacing: -1.65,
    color: C.ink,
  },
  h2: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5, color: C.ink },
  h3: { fontSize: 17, fontWeight: "700", color: C.ink, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 23, color: C.muted, letterSpacing: 0.05 },
  small: { fontSize: 12, lineHeight: 19, color: C.muted, letterSpacing: 0.08 },
  bold: { fontSize: 14, lineHeight: 21, fontWeight: "700", color: C.ink },
  card: {
    minWidth: 0,
    padding: 21,
    backgroundColor: "#FFFEFC",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    shadowColor: "#102219",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  button: {
    maxWidth: "100%",
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  primary: {
    backgroundColor: C.green,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 3,
  },
  secondary: {
    backgroundColor: "#F4F8F5",
    borderWidth: 1,
    borderColor: "#D6E5DB",
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "center",
  },
  chip: {
    maxWidth: "100%",
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    minHeight: 44,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFEFC",
  },
  chipActive: {
    backgroundColor: C.green,
    borderColor: C.green,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: C.muted, flexShrink: 1 },
  serviceTag: {
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: C.pale,
    borderWidth: 1,
    borderColor: "#D3E5D9",
  },
  serviceTagText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  capabilitySection: {
    gap: 10,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F0F7F2",
    borderWidth: 1,
    borderColor: "#CEE2D5",
  },
  requestSection: {
    gap: 10,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#FBF6EC",
    borderWidth: 1,
    borderColor: "#E8D9BC",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  capabilityEyebrow: {
    color: C.green,
    fontSize: 11,
    letterSpacing: 0.9,
    flexShrink: 1,
  },
  requestEyebrow: {
    color: "#805D2A",
    fontSize: 11,
    letterSpacing: 0.9,
    flexShrink: 1,
  },
  profileIdentity: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#EAF1E8",
    borderWidth: 1,
    borderColor: "#D1DDCD",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  trackRecord: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  needTag: {
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFFDFC",
    borderWidth: 1,
    borderColor: "#E5D5B7",
  },
  needTagText: {
    color: "#75582E",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D7DFD9",
    backgroundColor: "#FFFEFC",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: C.ink,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: C.green,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
  },
  pageIntro: {
    backgroundColor: "#193C2E",
    borderRadius: 24,
    gap: 13,
    marginBottom: 24,
    overflow: "hidden",
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2B503D",
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: { color: "#FCF9EF", maxWidth: 720 },
  introBody: { color: "#CCDCD0", maxWidth: 640 },
  communityEmblem: {
    width: 54,
    height: 58,
    borderRadius: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: "#193C2E",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  communityIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  cardActions: {
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 16,
    marginTop: 3,
  },
  threadRow: { borderWidth: 1, borderColor: C.line, paddingVertical: 16 },
  conversationHeader: {
    borderBottomWidth: 1,
    borderColor: C.line,
    paddingBottom: 18,
  },
  conversationSurface: {
    backgroundColor: "#F3F5F1",
    padding: 18,
    borderRadius: 18,
    gap: 16,
    minHeight: 240,
  },
  mobileSelected: { backgroundColor: C.pale, borderRadius: 16 },
  label: { fontSize: 13, color: C.ink, fontWeight: "700" },
  note: {
    minWidth: 0,
    backgroundColor: C.pale,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D6E6DB",
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  empty: {
    paddingVertical: 42,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 15,
    backgroundColor: "#FFFEFC",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLarge: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 20 },
  badge: {
    backgroundColor: "#F1F6F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dceae1",
  },
  softAction: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#FFFEFC",
    borderWidth: 1,
    borderColor: C.line,
  },
  match: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.pale,
    borderWidth: 1,
    borderColor: "#d9e8de",
  },
  link: { color: C.green, fontWeight: "600", fontSize: 13 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F1F5F2",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,24,16,.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    minWidth: 0,
    width: "100%",
    maxWidth: 760,
    maxHeight: "94%",
    backgroundColor: C.paper,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 22,
    borderBottomWidth: 1,
    borderColor: C.line,
    backgroundColor: "#FFFFFF",
  },
  modalBody: { padding: 24, gap: 20 },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: C.line,
    backgroundColor: "#FFFEFC",
    paddingTop: 7,
    paddingBottom: 8,
    paddingHorizontal: 12,
    gap: 6,
    shadowColor: "#102219",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  mobileNav: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 9,
    minHeight: 56,
  },
  mobileLabel: { fontSize: 10, color: C.muted, fontWeight: "600" },
  toast: {
    padding: 13,
    backgroundColor: "#EAF2E7",
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  hero: { paddingBottom: 28, gap: 14 },
  heroPanel: {
    backgroundColor: "#193C2E",
    borderWidth: 1,
    borderColor: "#193C2E",
    borderRadius: 24,
    padding: 28,
    overflow: "hidden",
  },
  heroMark: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#C1D7A4",
    marginBottom: 8,
  },
  search: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFEFC",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    paddingHorizontal: 18,
    shadowColor: "#102219",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: C.ink,
    paddingVertical: 17,
  },
  stats: {
    flex: 1,
    minWidth: 84,
    padding: 16,
    gap: 6,
    backgroundColor: "#F7FAF6",
    borderRadius: 14,
  },
  statNumber: { fontSize: 27, fontWeight: "700", color: C.ink },
  step: { flex: 1, height: 4, borderRadius: 4, backgroundColor: C.line },
  message: {
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: C.line,
    borderBottomLeftRadius: 4,
    maxWidth: "90%",
    alignSelf: "flex-start",
  },
  myMessage: {
    backgroundColor: "#DCECE2",
    alignSelf: "flex-end",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  footer: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 19,
    marginTop: 28,
    textAlign: "center",
  },
  art: {
    width: 84,
    height: 100,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
