import React from "react";
import { Feather } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
export type IconName = React.ComponentProps<typeof Feather>["name"];
export const C = {
  ink: "#15251d",
  muted: "#5f6f66",
  green: "#17623f",
  pale: "#e9f3ed",
  line: "#dce6df",
  paper: "#f4f7f4",
  gold: "#9b7334",
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
        danger && { backgroundColor: "#faece7" },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.82, transform: [{ scale: 0.99 }] },
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
        <Icon name={icon} size={17} color={secondary ? C.green : "#fff"} />
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
        pressed && { opacity: 0.76 },
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
  return (
    <View style={{ gap: 8, marginBottom: 18 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#8a948b"
        multiline={multiline}
        style={[
          s.input,
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
    gap: 10,
    minWidth: 0,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
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
    width: 238,
    backgroundColor: "#fbfcfa",
    borderRightWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
  },
  brand: {
    fontSize: 23,
    letterSpacing: -1.15,
    fontWeight: "800",
    color: C.ink,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.35,
    color: C.muted,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navActive: { backgroundColor: C.pale },
  navText: { fontSize: 14, color: C.muted, fontWeight: "600", flexShrink: 1 },
  content: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    paddingBottom: 40,
  },
  topbar: {
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderColor: C.line,
    marginBottom: 30,
  },
  heading: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "700",
    letterSpacing: -1.7,
    color: C.ink,
  },
  h2: { fontSize: 22, fontWeight: "700", letterSpacing: -0.55, color: C.ink },
  h3: { fontSize: 17, fontWeight: "700", color: C.ink, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 23, color: C.muted },
  small: { fontSize: 12, lineHeight: 19, color: C.muted },
  bold: { fontSize: 14, lineHeight: 21, fontWeight: "700", color: C.ink },
  card: {
    minWidth: 0,
    padding: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    shadowColor: "#102219",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 14,
    elevation: 2,
  },
  button: {
    maxWidth: "100%",
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  primary: {
    backgroundColor: C.green,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 2,
  },
  secondary: {
    backgroundColor: C.pale,
    borderWidth: 1,
    borderColor: "#dceae1",
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
    minHeight: 38,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: C.green, borderColor: C.green },
  chipText: { fontSize: 12, fontWeight: "600", color: C.muted, flexShrink: 1 },
  serviceTag: {
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: C.pale,
    borderWidth: 1,
    borderColor: "#d5e7db",
  },
  serviceTagText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  needTag: {
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#f8f9f7",
    borderWidth: 1,
    borderColor: C.line,
  },
  needTagText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d8e0d3",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: C.ink,
    minHeight: 48,
  },
  label: { fontSize: 13, color: C.ink, fontWeight: "700" },
  note: {
    minWidth: 0,
    backgroundColor: C.pale,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe9df",
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  empty: {
    paddingVertical: 42,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 15,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLarge: {
    width: 78,
    height: 78,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 20 },
  badge: {
    backgroundColor: C.pale,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dceae1",
  },
  softAction: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
  },
  match: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.pale,
    borderWidth: 1,
    borderColor: "#d9e8de",
  },
  link: { color: C.green, fontWeight: "600", fontSize: 13 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: "#f5f8f5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(12,29,20,.52)",
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  modalHeader: { padding: 22, borderBottomWidth: 1, borderColor: C.line },
  modalBody: { padding: 22, gap: 18 },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: C.line,
    backgroundColor: "#fff",
    paddingTop: 7,
    paddingBottom: 8,
    shadowColor: "#102219",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  mobileNav: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    minHeight: 56,
  },
  mobileLabel: { fontSize: 10, color: C.muted, fontWeight: "600" },
  toast: {
    padding: 13,
    backgroundColor: "#e8efdf",
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  hero: { paddingBottom: 28, gap: 14 },
  heroPanel: {
    backgroundColor: "#e7f1eb",
    borderWidth: 1,
    borderColor: "#d5e6da",
    borderRadius: 22,
    padding: 26,
    overflow: "hidden",
  },
  heroMark: {
    width: 42,
    height: 5,
    borderRadius: 4,
    backgroundColor: C.green,
    marginBottom: 20,
  },
  search: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingHorizontal: 17,
    shadowColor: "#102219",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: C.ink,
    paddingVertical: 17,
  },
  stats: { flex: 1, minWidth: 84, padding: 14, gap: 4 },
  statNumber: { fontSize: 26, fontWeight: "700", color: C.ink },
  step: { flex: 1, height: 4, borderRadius: 4, backgroundColor: C.line },
  message: {
    padding: 15,
    borderRadius: 16,
    backgroundColor: C.pale,
    maxWidth: "90%",
    alignSelf: "flex-start",
  },
  myMessage: { backgroundColor: "#d8ebdf", alignSelf: "flex-end" },
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
