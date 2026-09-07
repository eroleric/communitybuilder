import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  C,
  s,
  Icon,
  IconName,
  Button,
  Card,
  Chip,
  Field,
  Note,
  Empty,
  PageIntro,
  PhotoAvatar,
} from "./ui";
import {
  members,
  Member,
  Trade,
  State,
  Profile,
  initialState,
  skills,
  gifts,
} from "./data";

import { PersonalFields } from "./NeighborDiscovery";
import { ReferenceDiscovery } from "./ReferenceDiscovery";
import { getCommunity } from "./communityData";
import { resolveApproximateLocation } from "./locationHelpers";
import { CommunityHub } from "./CommunityHub";

const KEY = "commonhands.prototype.v2";
const navigation: [string, IconName][] = [
  ["Discover", "compass"],
  ["My trades", "repeat"],
  ["Messages", "message-circle"],
];
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const blank = (id: string): Trade => ({
  id: uid(),
  memberId: id,
  need: "",
  offer: "",
  theirEffort: "To be assessed",
  myEffort: "To be assessed",
  materials:
    "Each person supplies their own basic tools. Agree on parts before starting.",
  timing: "Arrange together",
  notes: "",
  stage: "Draft",
  mineDone: false,
  theirsDone: false,
  fair: null,
  created: new Date().toLocaleDateString(),
});
const initials = (name: string) =>
  name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");

export default function CommonHands() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <StatusBar style="dark" />
        <Workspace />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
function Workspace() {
  const { width } = useWindowDimensions();
  const desktop = width >= 980;
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [storageOK, setStorageOK] = useState(true);
  const [tab, setTab] = useState("Discover");
  const [modal, setModal] = useState<
    | "interest"
    | "personal"
    | "preferences"
    | "member"
    | "builder"
    | "trade"
    | "profile"
    | "help"
    | "report"
    | "reset"
    | "community"
    | null
  >(null);
  const [member, setMember] = useState<Member>(members[0]);
  const [draft, setDraft] = useState<Trade>(blank(members[0].id));
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [activeTrade, setActiveTrade] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [conversation, setConversation] = useState(members[0].id);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [profile, setProfile] = useState<Profile>(initialState.profile);
  const [extraSkill, setExtraSkill] = useState("");
  const [showPersonal, setShowPersonal] = useState(false);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed?.profile &&
            Array.isArray(parsed.trades) &&
            Array.isArray(parsed.saved) &&
            Array.isArray(parsed.messages)
          ) {
            const communities = initialState.communities;
            const oldProfile = parsed.profile;
            const profile = {
              ...initialState.profile,
              ...oldProfile,
              primaryCommunityId: oldProfile.primaryCommunityId,
              homeCommunityId: oldProfile.primaryCommunityId || "",
              serviceReach:
                oldProfile.serviceReach ||
                (oldProfile.remoteAvailable ? "Remote" : "Local"),
            };
            const memberships = Array.isArray(parsed.memberships)
              ? parsed.memberships.filter(
                  (item: any) =>
                    item.status &&
                    item.assignmentType !== "automatic" &&
                    communities.some((c) => c.id === item.communityId),
                )
              : [];
            if (live)
              setState({
                ...initialState,
                ...parsed,
                communities,
                memberships,
                profile,
              });
          }
        }
      })
      .catch(() => {
        if (live) {
          setStorageOK(false);
          setToast(
            "Saved data could not be loaded. This session is still usable.",
          );
        }
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {
        setStorageOK(false);
        setToast("Your device could not save changes. Keep this session open.");
      });
  }, [state, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  const notify = (text: string) => setToast(text);
  const go = (name: string) => {
    setTab(name);
    setModal(null);
  };
  const openMember = (m: Member) => {
    setMember(m);
    setModal("member");
  };
  const toggleSaved = (id: string) =>
    setState((p) => ({
      ...p,
      saved: p.saved.includes(id)
        ? p.saved.filter((x) => x !== id)
        : [...p.saved, id],
    }));
  const openBuilder = (m: Member, previous?: Trade) => {
    setMember(m);
    setDraft({
      ...blank(m.id),
      phase: "hello",
      materials: state.profile.tools || blank(m.id).materials,
      notes: state.profile.exclusions,
      ...(previous
        ? {
            need: previous.need,
            offer: previous.offer,
            theirEffort: previous.theirEffort,
            myEffort: previous.myEffort,
            materials: previous.materials,
            timing: previous.timing,
            notes: previous.notes,
          }
        : {}),
    });
    setStep(0);
    setAccepted(false);
    setModal("interest");
  };
  const continueDetails = (t: Trade) => {
    setMember(members.find((m) => m.id === t.memberId)!);
    setDraft({ ...t, phase: "details", interestConfirmed: true });
    setStep(0);
    setAccepted(false);
    setModal("builder");
  };
  const openPersonal = (kind: "personal" | "preferences") => {
    setProfile({ ...state.profile });
    setModal(kind);
  };
  useEffect(() => {
    if (
      !ready ||
      !["interest", "builder"].includes(modal || "") ||
      (!draft.need.trim() && !draft.offer.trim())
    )
      return;
    setState((p) => ({
      ...p,
      trades: [
        { ...draft, stage: "Draft" },
        ...p.trades.filter((t) => t.id !== draft.id),
      ],
    }));
  }, [draft, modal, ready]);
  const nextAction = (t: Trade) =>
    t.stage === "Draft"
      ? "Continue draft"
      : t.stage === "Interest sent"
        ? "Waiting to hear back"
        : t.stage === "Interested"
          ? "Work out the details"
          : t.stage === "Proposed"
            ? "Review the proposal"
            : t.stage === "Agreed"
              ? "Ready when you both are"
              : t.stage === "In progress"
                ? "Check in on the work"
                : t.stage === "Completed"
                  ? "Trade again"
                  : "View conversation";
  const storeTrade = (stage: Trade["stage"]) => {
    const next = { ...draft, stage };
    setState((p) => ({
      ...p,
      trades: [next, ...p.trades.filter((t) => t.id !== next.id)],
    }));
    setModal(null);
    setTab("My trades");
    notify(
      stage === "Draft"
        ? "Draft saved. Pick up where you left off."
        : stage === "Interest sent"
          ? "Your exchange invitation is saved. Nothing has been sent in this demo."
          : "Your proposal is ready for a shared review in this demo.",
    );
  };
  const current = state.trades.find((t) => t.id === activeTrade);
  const updateTrade = (patch: Partial<Trade>) =>
    setState((p) => ({
      ...p,
      trades: p.trades.map((t) =>
        t.id === activeTrade ? { ...t, ...patch } : t,
      ),
    }));
  const openProfile = () => {
    setProfile({ ...state.profile, skills: [...state.profile.skills] });
    setExtraSkill("");
    setStep(0);
    setShowPersonal(false);
    setModal("profile");
  };
  const saveProfileWithCommunity = (communityId?: string) => {
    const location = resolveApproximateLocation(profile.area);
    const now = new Date().toISOString();
    setState((previous) => {
      const selected = getCommunity(communityId, previous.communities);
      const alreadyJoined = previous.memberships.some(
        (item) =>
          item.userId === "local-user" && item.communityId === communityId,
      );
      const hasPrimary = previous.memberships.some(
        (item) => item.userId === "local-user" && item.primary,
      );
      const membership =
        selected && !alreadyJoined
          ? {
              userId: "local-user",
              communityId: selected.id,
              role: "member" as const,
              joinedAt: now,
              primary: !hasPrimary && selected.membershipType === "open",
              status:
                selected.membershipType === "approval"
                  ? ("pending" as const)
                  : ("active" as const),
            }
          : undefined;
      return {
        ...previous,
        memberships: membership
          ? [...previous.memberships, membership]
          : previous.memberships,
        profile: {
          ...profile,
          name: profile.name.trim(),
          area: profile.area.trim(),
          latitude: location.latitude,
          longitude: location.longitude,
          approximateLocationLabel: location.approximateLocationLabel,
          locationUpdatedAt: now,
          searchRadiusMiles:
            Number.parseInt(profile.radius, 10) || profile.searchRadiusMiles,
          remoteAvailable: profile.serviceReach !== "Local",
          onboarded: true,
          primaryCommunityId: membership?.primary
            ? membership.communityId
            : previous.profile.primaryCommunityId,
          homeCommunityId: membership?.primary
            ? membership.communityId
            : previous.profile.homeCommunityId,
        },
      };
    });
    setModal(null);
    notify(
      communityId
        ? "Profile saved and community choice recorded."
        : "Profile saved. You can join a community whenever you are ready.",
    );
  };
  const completed = state.trades.filter((t) => t.stage === "Completed").length;
  const visibleTrades = state.trades.filter(
    (t) =>
      tradeFilter === "All" ||
      (tradeFilter === "Starting out" &&
        ["Draft", "Interest sent", "Proposed"].includes(t.stage)) ||
      (tradeFilter === "Helping" &&
        ["Interested", "Agreed", "In progress"].includes(t.stage)) ||
      (tradeFilter === "Finished" &&
        ["Completed", "Cancelled", "Declined"].includes(t.stage)),
  );
  const safeMessages = state.messages.filter(
    (m) => !state.blocked.includes(m.memberId),
  );
  const threadIds = Array.from(new Set(safeMessages.map((m) => m.memberId)));
  const partner = members.find((m) => m.id === conversation)!;
  const homeCommunity = getCommunity(
    state.profile.primaryCommunityId,
    state.communities,
  );
  const pageTitle = tab === "Discover" ? "Discover your people" : tab;
  const heading = (title: string, text: string) => (
    <PageIntro
      title={title}
      text={text}
      icon={
        tab === "Messages"
          ? "message-circle"
          : tab === "My trades"
            ? "repeat"
            : "user"
      }
    />
  );
  const stat = (value: string, label: string) => (
    <View style={s.stats}>
      <Text style={s.statNumber}>{value}</Text>
      <Text style={s.small}>{label}</Text>
    </View>
  );
  if (!ready)
    return (
      <View style={s.empty}>
        <Text style={s.h2}>Opening your local network…</Text>
      </View>
    );
  return (
    <View style={{ flex: 1, height: "100%", flexDirection: "row" }}>
      {desktop && (
        <View style={s.sidebar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => go("Discover")}
            style={[s.row, { marginVertical: 15 }]}
          >
            <Icon name="link" size={26} />
            <Text style={s.brand}>commonhands.</Text>
          </Pressable>
          <Text style={[s.eyebrow, { fontSize: 8, marginBottom: 30 }]}>
            SKILLS · TRUST · LOCAL INDEPENDENCE
          </Text>
          {navigation.map(([name, i]) => (
            <Pressable
              accessibilityRole="button"
              key={name}
              onPress={() => go(name)}
              style={[s.nav, tab === name && s.navActive]}
            >
              <Icon name={i} />
              <Text style={[s.navText, tab === name && { color: C.green }]}>
                {name}
              </Text>
              {name === "My trades" && state.trades.length > 0 && (
                <Text style={s.small}>{state.trades.length}</Text>
              )}
            </Pressable>
          ))}
          <View style={{ marginTop: "auto", gap: 20, paddingTop: 35 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => go("Community")}
              style={s.row}
            >
              <Icon name="users" />
              <Text style={s.link}>Communities</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setModal("help")}
              style={s.row}
            >
              <Icon name="help-circle" />
              <Text style={s.link}>Trust & help</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => go("My profile")}
              style={[
                s.row,
                { borderTopWidth: 1, borderColor: C.line, paddingTop: 20 },
              ]}
            >
              <View style={s.avatar}>
                <Text style={s.bold}>
                  {state.profile.onboarded
                    ? initials(state.profile.name)
                    : "YOU"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.bold} numberOfLines={1}>
                  {state.profile.onboarded ? state.profile.name : "Your space"}
                </Text>
                <Text style={s.small}>Local demo profile</Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: desktop ? undefined : 600,
          height: "100%",
          alignSelf: "center",
          backgroundColor: C.paper,
        }}
      >
        {!!toast && (
          <View accessibilityLiveRegion="polite" style={[s.toast, s.between]}>
            <Text style={[s.small, { flex: 1, color: C.ink }]}>{toast}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              onPress={() => setToast("")}
            >
              <Icon name="x" size={18} />
            </Pressable>
          </View>
        )}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            s.content,
            { padding: desktop ? 34 : 16, maxWidth: desktop ? 1200 : 600 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <View style={[s.between, s.topbar]}>
            <View style={[!desktop && s.row, { gap: desktop ? 2 : 10 }]}>
              {!desktop && (
                <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: "#E1F2E7", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="users" size={27} />
                </View>
              )}
              <View>
                <Text style={desktop ? s.eyebrow : [s.brand, { fontSize: 29 }]}>
                  {desktop ? pageTitle.toUpperCase() : "commonhands."}
                </Text>
              {!desktop && (
                <Text style={[s.small, { color: C.ink, fontSize: 13 }]}>
                  Skills. Support. Stronger Together.
                </Text>
              )}
              </View>
            </View>
            <View style={s.row}>
              {desktop && (
                <View style={s.badge}>
                  <Text style={s.small}>Interactive demo</Text>
                </View>
              )}
              {!desktop && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Search"
                  onPress={() => notify("Use the search field below to find people and skills.")}
                  style={[s.iconButton, { backgroundColor: "transparent" }]}
                >
                  <Icon name="search" size={24} color="#102334" />
                </Pressable>
              )}
              {!desktop && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  onPress={() => notify("You're all caught up.")}
                  style={s.iconButton}
                >
                  <Icon name="bell" />
                  <View
                    style={{
                      position: "absolute",
                      right: 7,
                      top: 7,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#F05B45",
                    }}
                  />
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="My profile"
                onPress={() => go("My profile")}
                style={s.avatar}
              >
                <PhotoAvatar index={2} size={45} />
              </Pressable>
              {desktop && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Trust and help"
                  onPress={() => setModal("help")}
                  style={s.iconButton}
                >
                  <Icon name="shield" />
                </Pressable>
              )}
            </View>
          </View>
          {tab === "Discover" && (
            <ReferenceDiscovery
              state={state}
              onOpen={openMember}
              onSave={toggleSaved}
              onProfile={() =>
                state.profile.onboarded
                  ? openPersonal("personal")
                  : openProfile()
              }
              onCommunity={() => go("Community")}
              onHelp={() => setModal("help")}
              onMessage={(selected) => {
                setConversation(selected.id);
                go("Messages");
              }}
            />
          )}
          {tab === "My trades" && (
            <>
              {heading(
                "Commitments in progress.",
                "Connect first, then agree on scope, effort, expertise, materials, and timing.",
              )}
              <View style={[s.wrap, { marginBottom: 22 }]}>
                {["All", "Starting out", "Helping", "Finished"].map((x) => (
                  <Chip
                    key={x}
                    label={x}
                    active={tradeFilter === x}
                    onPress={() => setTradeFilter(x)}
                  />
                ))}
              </View>
              {!visibleTrades.length ? (
                <Empty
                  title={
                    state.trades.length
                      ? "Nothing in this stage"
                      : "Your first trade starts with a hello"
                  }
                  text="Find someone whose skills you need, then build a clear proposal together."
                  action={
                    <Button
                      label="Discover people"
                      icon="arrow-right"
                      onPress={() => go("Discover")}
                    />
                  }
                />
              ) : (
                <View style={{ gap: 15 }}>
                  {visibleTrades.map((t) => {
                    const m = members.find((x) => x.id === t.memberId)!;
                    return (
                      <Card key={t.id} style={{ gap: 15 }}>
                        <View style={s.between}>
                          <View style={s.row}>
                            <View
                              style={[s.avatar, { backgroundColor: m.color }]}
                            >
                              <Text style={s.bold}>{m.initials}</Text>
                            </View>
                            <View>
                              <Text style={s.bold}>Trade with {m.name}</Text>
                              <Text style={s.small}>
                                {t.created} · {m.skill}
                              </Text>
                            </View>
                          </View>
                          <View style={s.badge}>
                            <Text style={s.small}>{t.stage}</Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: desktop ? "row" : "column",
                            gap: 20,
                          }}
                        >
                          <View style={[s.requestSection, { flex: 1, gap: 6 }]}>
                            <Text style={s.eyebrow}>YOU RECEIVE</Text>
                            <Text style={s.body}>
                              {t.need || "Job details still to add"}
                            </Text>
                          </View>
                          <Icon name="repeat" />
                          <View
                            style={[s.capabilitySection, { flex: 1, gap: 6 }]}
                          >
                            <Text style={s.eyebrow}>YOU PROVIDE</Text>
                            <Text style={s.body}>
                              {t.offer || "Your offer still to add"}
                            </Text>
                          </View>
                        </View>
                        <Button
                          label={nextAction(t)}
                          secondary
                          icon="arrow-right"
                          onPress={() => {
                            setMember(m);
                            if (t.stage === "Draft") {
                              setDraft({ ...t });
                              setStep(0);
                              setAccepted(false);
                              setModal(
                                t.phase === "hello" ? "interest" : "builder",
                              );
                            } else if (t.stage === "Interested") {
                              continueDetails(t);
                            } else if (t.stage === "Completed") {
                              openBuilder(m, t);
                            } else {
                              setActiveTrade(t.id);
                              setModal("trade");
                            }
                          }}
                        />
                        {t.stage === "Completed" && (
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                              setActiveTrade(t.id);
                              setModal("trade");
                            }}
                            style={{ paddingVertical: 8 }}
                          >
                            <Text style={s.link}>
                              View the past agreement & feedback
                            </Text>
                          </Pressable>
                        )}
                      </Card>
                    );
                  })}
                </View>
              )}
              <View style={{ marginTop: 23 }}>
                <Note
                  title="It’s okay if it’s not a fit"
                  text="Nothing is owed for saying hello. You can always decline kindly, without a karma penalty."
                  icon="shield"
                />
              </View>
            </>
          )}
          {tab === "Messages" && (
            <>
              {heading(
                "Direct communication builds trust.",
                "Ask questions, clarify the work, and keep every commitment in one agreement.",
              )}
              <View
                style={{ flexDirection: desktop ? "row" : "column", gap: 20 }}
              >
                <View style={{ width: desktop ? 260 : "100%", gap: 9 }}>
                  {threadIds.map((id) => {
                    const m = members.find((x) => x.id === id)!;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={id}
                        onPress={() => setConversation(id)}
                        style={[
                          s.nav,
                          s.threadRow,
                          {
                            backgroundColor:
                              conversation === id ? C.pale : "#fff",
                          },
                        ]}
                      >
                        <View style={[s.avatar, { backgroundColor: m.color }]}>
                          <Text style={s.bold}>{m.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.bold}>{m.name}</Text>
                          <Text style={s.small} numberOfLines={1}>
                            {
                              safeMessages
                                .filter((x) => x.memberId === id)
                                .at(-1)?.text
                            }
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                  <Button
                    label="Find someone to talk to"
                    secondary
                    onPress={() => go("Discover")}
                  />
                </View>
                <Card style={{ flex: 1, gap: 18 }}>
                  {state.blocked.includes(conversation) ? (
                    <Empty
                      title="Conversation unavailable"
                      text="This member is blocked. You can manage blocked people in your profile."
                    />
                  ) : (
                    <>
                      <View style={[s.between, s.conversationHeader]}>
                        <View>
                          <Text style={s.h3}>{partner.name}</Text>
                          <Text style={s.small}>
                            {partner.skill} · demo conversation
                          </Text>
                        </View>
                        <Button
                          label="Propose an exchange"
                          secondary
                          onPress={() => openBuilder(partner)}
                        />
                      </View>
                      <Note
                        title="Preview conversation"
                        text="Messages stay on this device. No real person receives them or replies."
                      />
                      <View style={s.conversationSurface}>
                        {safeMessages
                          .filter((m) => m.memberId === conversation)
                          .map((m) => (
                            <View
                              key={m.id}
                              style={[s.message, m.mine && s.myMessage]}
                            >
                              <Text style={[s.body, { color: C.ink }]}>
                                {m.text}
                              </Text>
                              <Text style={[s.small, { marginTop: 6 }]}>
                                {m.mine ? "You · " : ""}
                                {m.time}
                              </Text>
                            </View>
                          ))}
                      </View>
                      <View style={s.wrap}>
                        {[
                          "What does the job include?",
                          "Who supplies the materials?",
                          "What timing works for you?",
                        ].map((text) => (
                          <Chip
                            key={text}
                            label={text}
                            onPress={() => setMessage(text)}
                          />
                        ))}
                      </View>
                      <Field
                        label="Your message"
                        value={message}
                        onChange={setMessage}
                        multiline
                        placeholder="Ask about the work…"
                      />
                      <Button
                        label="Add demo message"
                        icon="send"
                        disabled={!message.trim()}
                        onPress={() => {
                          setState((p) => ({
                            ...p,
                            messages: [
                              ...p.messages,
                              {
                                id: uid(),
                                memberId: conversation,
                                text: message.trim(),
                                time: new Date().toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }),
                                mine: true,
                              },
                            ],
                          }));
                          setMessage("");
                          notify("Message saved locally. Nothing was sent.");
                        }}
                      />
                    </>
                  )}
                </Card>
              </View>
            </>
          )}
          {tab === "Community" && (
            <CommunityHub
              state={state}
              setState={setState}
              members={members}
              notify={notify}
            />
          )}
          {tab === "My profile" && (
            <>
              {heading(
                "Build a profile people can rely on.",
                "Show what you provide, how you work, and the experience you bring.",
              )}
              <View
                style={{ flexDirection: desktop ? "row" : "column", gap: 22 }}
              >
                <View style={{ flex: 1, gap: 20 }}>
                  <Card style={{ gap: 20 }}>
                    <View style={s.row}>
                      <View
                        style={[s.avatarLarge, { backgroundColor: "#e5eddc" }]}
                      >
                        <Text style={[s.h2, { fontSize: 25 }]}>
                          {state.profile.onboarded
                            ? initials(state.profile.name)
                            : "YOU"}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.h2}>
                          {state.profile.onboarded
                            ? state.profile.name
                            : "Your profile is a fresh start"}
                        </Text>
                        <Text style={s.body}>
                          {state.profile.area} · approximate area only
                        </Text>
                        <Text style={s.small}>
                          {state.profile.availability} · {state.profile.radius}{" "}
                          travel radius
                        </Text>
                      </View>
                    </View>
                    <Text style={s.body}>
                      {state.profile.bio ||
                        "Describe your experience, working approach, and the tasks you can take responsibility for."}
                    </Text>
                    <View
                      style={[
                        s.note,
                        {
                          flexDirection: desktop ? "row" : "column",
                          alignItems: "stretch",
                        },
                      ]}
                    >
                      <View
                        style={[s.row, { flex: 1, alignItems: "flex-start" }]}
                      >
                        <Icon name="map-pin" />
                        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                          <Text style={s.bold}>Primary Community</Text>
                          <Text style={s.body}>
                            {homeCommunity?.name || "No community selected"}
                          </Text>
                          <Text style={s.small}>
                            Chosen voluntarily and separate from your location
                          </Text>
                        </View>
                      </View>
                      <Button
                        label={
                          homeCommunity ? "View or change" : "Find a community"
                        }
                        secondary
                        onPress={() => go("Community")}
                      />
                    </View>
                    <View style={s.between}>
                      <View>
                        <Text style={s.bold}>Service reach</Text>
                        <Text style={s.body}>{state.profile.serviceReach}</Text>
                      </View>
                      {state.profile.serviceReach !== "Remote" && (
                        <Text style={s.small}>
                          {state.profile.radius} travel radius
                        </Text>
                      )}
                    </View>
                    <Text style={s.bold}>I can help with</Text>
                    <View style={s.wrap}>
                      {state.profile.skills.map((x) => (
                        <View key={x} style={s.chip}>
                          <Text style={s.chipText}>{x}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ gap: 8 }}>
                      <Text style={s.h3}>Working style & interests</Text>
                      <Text style={s.body}>
                        {state.profile.interests.length
                          ? state.profile.interests.join(" · ")
                          : "Add a few interests that can help a practical connection become a lasting one."}
                      </Text>
                      {!!state.profile.workingStyle && (
                        <Text style={s.body}>{state.profile.workingStyle}</Text>
                      )}
                      <Button
                        label="Edit working style & interests"
                        secondary
                        onPress={() => openPersonal("personal")}
                      />
                    </View>
                    {state.profile.onboarded && (
                      <View style={{ gap: 8 }}>
                        <Text style={s.h3}>I could use help with</Text>
                        <Text style={s.body}>
                          {state.profile.wants.length
                            ? state.profile.wants.join(" · ")
                            : "No preferences yet. You can still search for anything you need."}
                        </Text>
                        <Button
                          label="Edit exchange preferences"
                          secondary
                          onPress={() => openPersonal("preferences")}
                        />
                      </View>
                    )}
                    <Button
                      label={
                        state.profile.onboarded
                          ? "Edit profile"
                          : "Complete my profile"
                      }
                      icon="edit-2"
                      onPress={openProfile}
                    />
                  </Card>
                  <Card>
                    <Text style={s.h3}>Trust earned through action</Text>
                    <View style={[s.row, { marginVertical: 16 }]}>
                      {stat(String(completed), "Demo karma")}
                      {stat(String(completed), "Completed trades")}
                      {stat(String(state.saved.length), "Saved people")}
                    </View>
                    <Text style={s.small}>
                      Contribution karma recognizes confirmed participation. It
                      is never spendable and does not certify skill quality.
                    </Text>
                  </Card>
                </View>
                <View style={{ width: desktop ? 300 : "100%", gap: 20 }}>
                  <Card style={{ gap: 15 }}>
                    <Text style={s.h3}>Trust & privacy</Text>
                    <View style={s.row}>
                      <Icon name="map-pin" />
                      <Text style={[s.body, { flex: 1 }]}>
                        Exact address is never requested in this prototype.
                      </Text>
                    </View>
                    <View style={s.row}>
                      <Icon name="shield" />
                      <Text style={[s.body, { flex: 1 }]}>
                        Identity and credentials: not verified.
                      </Text>
                    </View>
                    <Button
                      label="Understand trust signals"
                      secondary
                      onPress={() => setModal("help")}
                    />
                  </Card>
                  <Card style={{ gap: 14 }}>
                    <Text style={s.h3}>Blocked people</Text>
                    {!state.blocked.length ? (
                      <Text style={s.small}>You haven’t blocked anyone.</Text>
                    ) : (
                      state.blocked.map((id) => (
                        <View key={id} style={s.between}>
                          <Text style={s.body}>
                            {members.find((m) => m.id === id)?.name}
                          </Text>
                          <Button
                            label="Unblock"
                            secondary
                            onPress={() =>
                              setState((p) => ({
                                ...p,
                                blocked: p.blocked.filter((x) => x !== id),
                              }))
                            }
                          />
                        </View>
                      ))
                    )}
                  </Card>
                  <Card style={{ gap: 13 }}>
                    <Text style={s.h3}>Your demo data</Text>
                    <Text style={s.small}>
                      {storageOK
                        ? "Saved on this device. No account or cloud sync is connected."
                        : "Storage is unavailable. Changes may be lost when you leave."}
                    </Text>
                    <Button
                      label="Reset demo data"
                      secondary
                      danger
                      onPress={() => setModal("reset")}
                    />
                  </Card>
                </View>
              </View>
            </>
          )}
          <View style={{ marginTop: 26 }}>
            <Note
              title="Shared community standard"
              text="Please keep commitments, communicate directly, respect boundaries and property, care for shared tools, be honest about your limits, and leave every work area orderly. These standards apply to everyone."
              icon="shield"
            />
          </View>
          <Text style={s.footer}>
            COMMONHANDS · Interactive prototype · Sample members & trust history
            · {storageOK ? "Changes saved on this device" : "Session only"}
          </Text>
        </ScrollView>
        {!desktop && (
          <View style={s.bottomNav}>
            {(
              [
                ["Home", "Discover", "home"],
                ["Explore", "Discover", "search"],
                ["Post", "Post", "plus"],
                ["Communities", "Community", "users"],
                ["Profile", "My profile", "user"],
              ] as [string, string, IconName][]
            ).map(([label, target, i]) => (
              <Pressable
                accessibilityRole="button"
                key={label}
                accessibilityLabel={label}
                onPress={() =>
                  target === "Post" ? setModal("profile") : go(target)
                }
                style={[
                  s.mobileNav,
                  tab === target && label !== "Explore" && s.mobileSelected,
                  target === "Post" && { marginTop: -22 },
                ]}
              >
                <View
                  style={
                    target === "Post"
                      ? {
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: C.green,
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: C.green,
                          shadowOpacity: 0.25,
                          shadowRadius: 8,
                          elevation: 5,
                        }
                      : undefined
                  }
                >
                  <Icon
                    name={i}
                    size={target === "Post" ? 27 : 23}
                    color={
                      target === "Post"
                        ? "#fff"
                        : tab === target && label !== "Explore"
                          ? C.green
                          : "#183247"
                    }
                  />
                </View>
                <Text
                  style={[
                    s.mobileLabel,
                    tab === target && label !== "Explore" && { color: C.green, fontWeight: "800" },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <Modal
        visible={!!modal}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.modalOverlay}
        >
          <View style={s.modal}>
            <View style={[s.between, s.modalHeader]}>
              <Text style={s.h2}>
                {modal === "interest"
                  ? "Invite an exchange"
                  : modal === "personal"
                    ? "Working style and interests"
                    : modal === "preferences"
                      ? "Set exchange preferences"
                      : modal === "member"
                        ? "Review capability and fit"
                        : modal === "builder"
                          ? "Agree on the work"
                          : modal === "trade"
                            ? "Your agreement"
                            : modal === "profile"
                              ? "Make yourself known"
                              : modal === "report"
                                ? "Report a concern"
                                : modal === "community"
                                  ? "Choose your community"
                                  : modal === "reset"
                                    ? "Start fresh?"
                                    : "Trust, without guesswork"}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                onPress={() => setModal(null)}
                style={s.iconButton}
              >
                <Icon name="x" size={23} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={s.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              {(modal === "personal" || modal === "preferences") && (
                <>
                  <PersonalFields
                    profile={profile}
                    onChange={setProfile}
                    preferences={modal === "preferences"}
                  />
                  <Button
                    label="Save profile details"
                    onPress={() => {
                      setState((p) => ({
                        ...p,
                        profile: {
                          ...p.profile,
                          interests: profile.interests,
                          workingStyle: profile.workingStyle,
                          wants: profile.wants,
                          tools: profile.tools,
                          exclusions: profile.exclusions,
                        },
                      }));
                      setModal(null);
                      notify("Profile details saved on this device.");
                    }}
                  />
                </>
              )}
              {modal === "interest" && (
                <>
                  <View style={s.row}>
                    <View style={[s.avatar, { backgroundColor: member.color }]}>
                      <Text style={s.bold}>{member.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.h3}>
                        Invite {member.name.split(" ")[0]} to discuss an
                        exchange
                      </Text>
                      <Text style={s.small}>
                        An idea to consider, not a commitment.
                      </Text>
                    </View>
                  </View>
                  <Text style={s.body}>
                    State the work you need and what you can provide. If there
                    is mutual interest, the app will guide both sides through
                    the details.
                  </Text>
                  <Text style={s.label}>I could use a hand with…</Text>
                  <View style={s.wrap}>
                    {member.examples.map((x) => (
                      <Chip
                        key={x}
                        label={x}
                        active={draft.need === x}
                        onPress={() => setDraft({ ...draft, need: x })}
                      />
                    ))}
                  </View>
                  <Field
                    label="The help I have in mind"
                    value={draft.need}
                    onChange={(need) => setDraft({ ...draft, need })}
                    multiline
                    placeholder="Pick a task above or describe another"
                  />
                  <Text style={s.label}>And I could help you with…</Text>
                  <View style={s.wrap}>
                    {state.profile.skills.map((x) => (
                      <Chip
                        key={x}
                        label={x}
                        active={draft.offer === x}
                        onPress={() => setDraft({ ...draft, offer: x })}
                      />
                    ))}
                  </View>
                  <Field
                    label="My offer to help"
                    value={draft.offer}
                    onChange={(offer) => setDraft({ ...draft, offer })}
                    multiline
                    placeholder="Pick one of your skills or suggest something specific"
                  />
                  <Text style={s.small}>
                    {member.exchangeIdeas[0]} This is only an example, not an
                    expected exchange rate.
                  </Text>
                  {(!draft.need.trim() || !draft.offer.trim()) && (
                    <Text accessibilityLiveRegion="polite" style={s.small}>
                      Choose the help you need and what you can offer to
                      continue.
                    </Text>
                  )}
                  <Button
                    label="Save exchange invitation (demo)"
                    icon="send"
                    disabled={!draft.need.trim() || !draft.offer.trim()}
                    onPress={() => storeTrade("Interest sent")}
                  />
                  <Text style={s.small}>
                    Autosaved on this device. In this demo, no invitation is
                    actually sent. Saying no is always okay.
                  </Text>
                </>
              )}
              {modal === "member" && (
                <>
                  <View
                    style={[
                      s.profileIdentity,
                      !desktop && {
                        flexDirection: "column",
                        alignItems: "flex-start",
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.avatarLarge,
                        { backgroundColor: member.color },
                        !desktop && { width: 56, height: 56, borderRadius: 18 },
                      ]}
                    >
                      <Text style={[s.h2, { fontSize: 26 }]}>
                        {member.initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.h2}>{member.name}</Text>
                      <Text style={s.body}>
                        {member.locationLabel} ·{" "}
                        {getCommunity(member.communityId, state.communities)
                          ?.name || "Independent member"}
                      </Text>
                      <Text style={s.small}>{member.available}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Save profile"
                      style={[
                        s.iconButton,
                        !desktop && {
                          position: "absolute",
                          top: 18,
                          right: 18,
                        },
                      ]}
                      onPress={() => toggleSaved(member.id)}
                    >
                      <Icon
                        name="bookmark"
                        color={
                          state.saved.includes(member.id) ? C.gold : C.green
                        }
                      />
                    </Pressable>
                  </View>
                  <Text style={s.bold}>{member.title}</Text>
                  <Text style={s.body}>{member.about}</Text>
                  <View style={s.trackRecord}>
                    <Text style={s.h3}>Capability and track record</Text>
                    <Text style={s.body}>
                      {member.years} years’ experience (self-described) ·{" "}
                      {member.trades} sample completed exchanges ·{" "}
                      {member.repeatPartners} repeat partners
                    </Text>
                    <Text style={s.small}>
                      Sample profile. Credentials are not verified; contribution
                      karma does not certify workmanship.
                    </Text>
                  </View>
                  <View style={[s.capabilitySection, { gap: 14 }]}>
                    <View style={s.sectionHeader}>
                      <Icon name="tool" size={17} color={C.green} />
                      <Text style={s.h3}>Can help with</Text>
                    </View>
                    <View style={s.wrap}>
                      {member.offers.map((x) => (
                        <View key={x} style={s.serviceTag}>
                          <Text style={s.serviceTagText}>{x}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={s.divider} />
                    <Text style={s.eyebrow}>EXAMPLE WORK</Text>
                    {member.examples.map((x) => (
                      <View key={x} style={s.row}>
                        <Icon name="check-circle" size={16} />
                        <Text style={[s.body, { flex: 1 }]}>{x}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ gap: 10 }}>
                    <Text style={s.h3}>Working style</Text>
                    <Text style={s.body}>{member.workingStyle}</Text>
                  </View>
                  <View style={s.requestSection}>
                    <View style={s.sectionHeader}>
                      <Icon name="search" size={17} color="#805D2A" />
                      <Text style={s.h3}>Could use help with</Text>
                    </View>
                    <View style={s.wrap}>
                      {member.wants.map((x) => (
                        <View key={x} style={s.needTag}>
                          <Text style={s.needTagText}>{x}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={s.h3}>An exchange I’d consider</Text>
                  {member.exchangeIdeas.map((x) => (
                    <Text style={s.body} key={x}>
                      {x}
                    </Text>
                  ))}
                  <Text style={s.small}>
                    A sample conversation starter, not a fixed rate. Both jobs
                    still need to make sense for each person.
                  </Text>
                  <View style={{ gap: 8 }}>
                    <Text style={s.h3}>Beyond the work</Text>
                    <Text style={s.body}>{member.interests.join(" · ")}</Text>
                    {member.interests.some((x) =>
                      state.profile.interests.includes(x),
                    ) && (
                      <Text style={s.link}>
                        You both enjoy{" "}
                        {member.interests
                          .filter((x) => state.profile.interests.includes(x))
                          .join(" & ")
                          .toLowerCase()}
                        .
                      </Text>
                    )}
                    <Text style={s.small}>
                      A shared interest can deepen a connection, but it is never
                      required for an exchange.
                    </Text>
                  </View>
                  <Button
                    label="Propose an exchange"
                    icon="repeat"
                    onPress={() => openBuilder(member)}
                  />
                  <Button
                    label="Open demo conversation"
                    secondary
                    icon="message-circle"
                    onPress={() => {
                      setConversation(member.id);
                      if (!state.messages.some((m) => m.memberId === member.id))
                        setState((p) => ({
                          ...p,
                          messages: [
                            ...p.messages,
                            {
                              id: uid(),
                              memberId: member.id,
                              text: "This is the start of your demo conversation. Ask a question to clarify the work.",
                              time: "Demo introduction",
                              mine: false,
                            },
                          ],
                        }));
                      go("Messages");
                    }}
                  />
                  <View style={s.between}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setReportReason("");
                        setModal("report");
                      }}
                    >
                      <Text style={s.link}>Report a concern</Text>
                    </Pressable>
                    <Button
                      label="Block this profile"
                      secondary
                      danger
                      onPress={() => {
                        setState((p) => ({
                          ...p,
                          blocked: [...new Set([...p.blocked, member.id])],
                        }));
                        setModal(null);
                        notify(
                          "Profile blocked locally and hidden from discovery and messages.",
                        );
                      }}
                    />
                  </View>
                </>
              )}
              {modal === "builder" && (
                <>
                  <View style={s.row}>
                    {[0, 1, 2].map((n) => (
                      <View
                        key={n}
                        style={[
                          s.step,
                          n <= step && { backgroundColor: C.green },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={s.eyebrow}>
                    STEP {step + 1} OF 3 · {member.name.toUpperCase()}
                  </Text>
                  {step === 0 ? (
                    <>
                      <Text style={s.h3}>
                        Start with the work, on both sides.
                      </Text>
                      <Text style={s.body}>
                        Choose a starting point, then make the scope specific.
                        These are prompts, not estimates from the provider.
                      </Text>
                      <View style={s.wrap}>
                        {member.examples.map((x) => (
                          <Chip
                            key={x}
                            label={x}
                            active={draft.need === x}
                            onPress={() => setDraft({ ...draft, need: x })}
                          />
                        ))}
                      </View>
                      <Field
                        label="The help I need"
                        value={draft.need}
                        onChange={(need) => setDraft({ ...draft, need })}
                        multiline
                        placeholder="What should be done? Include quantities and exclusions."
                      />
                      <View style={s.wrap}>
                        {state.profile.skills.map((x) => (
                          <Chip
                            key={x}
                            label={x}
                            onPress={() =>
                              setDraft({ ...draft, offer: `${x}: ` })
                            }
                          />
                        ))}
                      </View>
                      <Field
                        label="The work I can provide"
                        value={draft.offer}
                        onChange={(offer) => setDraft({ ...draft, offer })}
                        multiline
                        placeholder="Describe what you will deliver in return."
                      />
                    </>
                  ) : step === 1 ? (
                    <>
                      <Text style={s.h3}>
                        Make the expectations comfortable.
                      </Text>
                      <Field
                        label="Expected effort for their work"
                        value={draft.theirEffort}
                        onChange={(theirEffort) =>
                          setDraft({ ...draft, theirEffort })
                        }
                        placeholder="For example: assessment needed"
                      />
                      <Field
                        label="Expected effort for my work"
                        value={draft.myEffort}
                        onChange={(myEffort) =>
                          setDraft({ ...draft, myEffort })
                        }
                        placeholder="Include preparation and travel"
                      />
                      <Field
                        label="Materials & equipment responsibilities"
                        value={draft.materials}
                        onChange={(materials) =>
                          setDraft({ ...draft, materials })
                        }
                        multiline
                      />
                      <Field
                        label="Timing & scheduling"
                        value={draft.timing}
                        onChange={(timing) => setDraft({ ...draft, timing })}
                      />
                      <Field
                        label="Expertise, exclusions & questions"
                        value={draft.notes}
                        onChange={(notes) => setDraft({ ...draft, notes })}
                        multiline
                        placeholder="What experience is needed? What should be inspected first?"
                      />
                      <Note
                        title="Hours are context, not a price"
                        text="Different expertise and effort can still make a good trade. The other person must confirm their scope and estimate."
                      />
                    </>
                  ) : (
                    <>
                      <Text style={s.h3}>
                        A clear proposal for both of you.
                      </Text>
                      <Card style={{ gap: 15 }}>
                        <Text style={s.eyebrow}>
                          YOU RECEIVE · {member.skill.toUpperCase()}
                        </Text>
                        <Text style={s.body}>{draft.need}</Text>
                        <Text style={s.small}>Effort: {draft.theirEffort}</Text>
                        <View style={s.divider} />
                        <Text style={s.eyebrow}>YOU PROVIDE</Text>
                        <Text style={s.body}>{draft.offer}</Text>
                        <Text style={s.small}>Effort: {draft.myEffort}</Text>
                      </Card>
                      <Text style={s.bold}>Materials</Text>
                      <Text style={s.body}>{draft.materials}</Text>
                      <Text style={s.bold}>Timing</Text>
                      <Text style={s.body}>{draft.timing}</Text>
                      {!!draft.notes && (
                        <Text style={s.body}>{draft.notes}</Text>
                      )}
                      <Note
                        title="Adjust the work, not a price"
                        text="If this doesn't feel balanced, revise the scope, add a useful task, or leave it open for discussion. No automatic fairness score is applied."
                      />
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: accepted }}
                        onPress={() => setAccepted(!accepted)}
                        style={[s.row, { paddingVertical: 12 }]}
                      >
                        <Icon name={accepted ? "check-square" : "square"} />
                        <Text style={[s.body, { flex: 1 }]}>
                          This proposal works for me, subject to the other
                          person confirming the details.
                        </Text>
                      </Pressable>
                    </>
                  )}
                  {step === 0 &&
                    (draft.need.trim().length < 8 ||
                      draft.offer.trim().length < 8) && (
                      <Text style={s.small}>
                        Add a short description of each job (at least 8
                        characters) to continue.
                      </Text>
                    )}
                  {step === 1 &&
                    (!draft.theirEffort.trim() ||
                      !draft.myEffort.trim() ||
                      !draft.materials.trim() ||
                      !draft.timing.trim()) && (
                      <Text style={s.small}>
                        Add effort, materials, and timing. “To be assessed” is
                        okay when you need to inspect first.
                      </Text>
                    )}
                  {step === 2 && !accepted && (
                    <Text style={s.small}>
                      Confirm that this proposal works for you before sharing
                      it.
                    </Text>
                  )}
                  <View style={s.between}>
                    <Button
                      label={step === 0 ? "Save draft" : "Back"}
                      secondary
                      onPress={() =>
                        step === 0 ? storeTrade("Draft") : setStep(step - 1)
                      }
                    />
                    {step < 2 ? (
                      <Button
                        label="Continue"
                        icon="arrow-right"
                        disabled={
                          step === 0
                            ? draft.need.trim().length < 8 ||
                              draft.offer.trim().length < 8
                            : !draft.theirEffort.trim() ||
                              !draft.myEffort.trim() ||
                              !draft.materials.trim() ||
                              !draft.timing.trim()
                        }
                        onPress={() => setStep(step + 1)}
                      />
                    ) : (
                      <Button
                        label="Create demo proposal"
                        disabled={!accepted}
                        icon="check"
                        onPress={() => storeTrade("Proposed")}
                      />
                    )}
                  </View>
                  {step > 0 && (
                    <Button
                      label="Save draft & close"
                      secondary
                      onPress={() => storeTrade("Draft")}
                    />
                  )}
                  <Text style={s.small}>
                    Your draft saves automatically on this device. No proposal
                    is sent in this demo.
                  </Text>
                </>
              )}
              {modal === "trade" && current && (
                <>
                  {current.stage === "Interest sent" && (
                    <>
                      <Text style={s.h3}>
                        Let’s see if the idea feels right.
                      </Text>
                      <Text style={s.body}>
                        You suggested helping with {current.offer.toLowerCase()}{" "}
                        in exchange for {current.need.toLowerCase()}.
                      </Text>
                      <Text style={s.small}>
                        Waiting for interest — neither person is committed yet.
                      </Text>
                      <Note
                        title="Try the other side · demo"
                        text="These controls simulate a response. No real neighbor is accepting or declining."
                      />
                      <Button
                        label="Simulate: sounds good"
                        onPress={() =>
                          updateTrade({
                            stage: "Interested",
                            interestConfirmed: true,
                          })
                        }
                      />
                      <Button
                        label="Simulate: suggest a different task"
                        secondary
                        onPress={() => {
                          setDraft({ ...current, stage: "Draft" });
                          setMember(
                            members.find((m) => m.id === current.memberId)!,
                          );
                          setModal("interest");
                        }}
                      />
                      <Button
                        label="Ask a question first"
                        secondary
                        onPress={() => {
                          setConversation(current.memberId);
                          go("Messages");
                        }}
                      />
                      <Button
                        label="Simulate: not this time"
                        secondary
                        onPress={() => updateTrade({ stage: "Declined" })}
                      />
                    </>
                  )}
                  {current.stage === "Interested" && (
                    <>
                      <Note
                        title="You’re both interested · simulated"
                        text="Now you can decide what’s included, who brings what, and a comfortable time to help."
                        icon="smile"
                      />
                      <Button
                        label="Work out the details"
                        onPress={() => continueDetails(current)}
                      />
                    </>
                  )}
                  {current.stage === "Declined" && (
                    <>
                      <Note
                        title="Not a fit this time — that’s okay"
                        text="No obligation, no karma penalty. You can find another neighbor whenever you’re ready."
                        icon="heart"
                      />
                      <Button
                        label="Meet other neighbors"
                        onPress={() => go("Discover")}
                      />
                    </>
                  )}
                  {!["Interest sent", "Interested", "Declined"].includes(
                    current.stage,
                  ) && (
                    <>
                      <View style={s.between}>
                        <Text style={s.h3}>
                          You &{" "}
                          {members.find((m) => m.id === current.memberId)?.name}
                        </Text>
                        <View style={s.badge}>
                          <Text style={s.small}>{current.stage}</Text>
                        </View>
                      </View>
                      <Card style={{ gap: 12 }}>
                        <Text style={s.eyebrow}>YOU RECEIVE</Text>
                        <Text style={s.body}>{current.need}</Text>
                        <Text style={s.small}>
                          Effort: {current.theirEffort}
                        </Text>
                        <View style={s.divider} />
                        <Text style={s.eyebrow}>YOU PROVIDE</Text>
                        <Text style={s.body}>{current.offer}</Text>
                        <Text style={s.small}>Effort: {current.myEffort}</Text>
                      </Card>
                      <Text style={s.bold}>Materials & timing</Text>
                      <Text style={s.body}>{current.materials}</Text>
                      <Text style={s.body}>{current.timing}</Text>
                      {!!current.notes && (
                        <Text style={s.body}>{current.notes}</Text>
                      )}
                    </>
                  )}
                  {current.stage === "Proposed" && (
                    <>
                      <Note
                        title="Waiting for agreement"
                        text="In a live app, only your partner could accept their side. The control below simulates their acceptance for this demo."
                      />
                      <Button
                        label="Simulate partner acceptance"
                        onPress={() => updateTrade({ stage: "Agreed" })}
                      />
                      <Button
                        label="Revise proposal"
                        secondary
                        onPress={() => {
                          setDraft({ ...current, stage: "Draft" });
                          setMember(
                            members.find((m) => m.id === current.memberId)!,
                          );
                          setStep(0);
                          setAccepted(false);
                          setModal("builder");
                        }}
                      />
                    </>
                  )}
                  {current.stage === "Agreed" && (
                    <>
                      <Note
                        title="Both sides agreed · simulated"
                        text="Only the work above is included. Pause and agree on any additional work before doing it."
                        icon="check-circle"
                      />
                      <Button
                        label="Start demo trade"
                        onPress={() => updateTrade({ stage: "In progress" })}
                      />
                    </>
                  )}
                  {current.stage === "In progress" && (
                    <>
                      <Note
                        title="Confirm each side separately"
                        text="Only close a trade after both agreed jobs have been delivered. These confirmations are simulations."
                      />
                      <Button
                        label={
                          current.mineDone
                            ? "Your work marked complete"
                            : "Mark my work complete (demo)"
                        }
                        disabled={current.mineDone}
                        secondary
                        onPress={() => updateTrade({ mineDone: true })}
                      />
                      <Button
                        label={
                          current.theirsDone
                            ? "Partner work marked complete"
                            : "Simulate partner completion"
                        }
                        disabled={current.theirsDone}
                        secondary
                        onPress={() => updateTrade({ theirsDone: true })}
                      />
                      <Button
                        label="Close completed demo trade"
                        disabled={!current.mineDone || !current.theirsDone}
                        onPress={() => {
                          updateTrade({ stage: "Completed" });
                          notify(
                            "Demo trade completed. One contribution added to your demo karma.",
                          );
                        }}
                      />
                    </>
                  )}
                  {current.stage === "Completed" && (
                    <>
                      <Button
                        label="Trade again with this neighbor"
                        onPress={() =>
                          openBuilder(
                            members.find((m) => m.id === current.memberId)!,
                            current,
                          )
                        }
                      />
                      <Note
                        title="A good connection, built together"
                        text="Both sides are marked complete in this simulation. Your contribution is recognized in your profile."
                        icon="check-circle"
                      />
                      <Text style={s.h3}>Did this trade feel fair to you?</Text>
                      <View style={s.wrap}>
                        <Chip
                          label="Yes, it felt fair"
                          active={current.fair === true}
                          onPress={() => updateTrade({ fair: true })}
                        />
                        <Chip
                          label="It could be improved"
                          active={current.fair === false}
                          onPress={() => updateTrade({ fair: false })}
                        />
                      </View>
                      <Text style={s.small}>
                        Your feedback is saved locally and does not change
                        karma.
                      </Text>
                    </>
                  )}
                  {!["Completed", "Cancelled", "Declined"].includes(
                    current.stage,
                  ) && (
                    <Button
                      label="Cancel demo trade"
                      secondary
                      danger
                      onPress={() => {
                        updateTrade({ stage: "Cancelled" });
                        notify("Trade cancelled. No karma was deducted.");
                      }}
                    />
                  )}
                </>
              )}
              {modal === "profile" && (
                <>
                  <View style={s.row}>
                    {[0, 1, 2].map((n) => (
                      <View
                        key={n}
                        style={[
                          s.step,
                          n <= step && { backgroundColor: C.green },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={s.eyebrow}>
                    STEP {step + 1} OF 3 ·{" "}
                    {step === 0
                      ? "WHAT YOU PROVIDE"
                      : step === 1
                        ? "HOW YOU HELP"
                        : "FIND YOUR COMMUNITY"}
                  </Text>
                  {step === 0 ? (
                    <>
                      <Text style={s.h3}>What can people come to you for?</Text>
                      <Text style={s.body}>
                        Choose everything you can confidently help with. You’ll
                        search for what you need after your profile is ready.
                      </Text>
                      <View style={s.wrap}>
                        {[...new Set([...skills, ...profile.skills])].map(
                          (x) => (
                            <Chip
                              key={x}
                              label={x}
                              active={profile.skills.includes(x)}
                              onPress={() =>
                                setProfile({
                                  ...profile,
                                  skills: profile.skills.includes(x)
                                    ? profile.skills.filter((y) => y !== x)
                                    : [...profile.skills, x],
                                })
                              }
                            />
                          ),
                        )}
                      </View>
                      <Field
                        label="Another skill"
                        value={extraSkill}
                        onChange={setExtraSkill}
                        placeholder="Something else you can help with"
                      />
                      <Button
                        label="Add skill"
                        secondary
                        disabled={!extraSkill.trim()}
                        onPress={() => {
                          setProfile({
                            ...profile,
                            skills: [
                              ...new Set([
                                ...profile.skills,
                                extraSkill.trim(),
                              ]),
                            ],
                          });
                          setExtraSkill("");
                        }}
                      />
                      <Button
                        label="Continue"
                        icon="arrow-right"
                        disabled={!profile.skills.length}
                        onPress={() => setStep(1)}
                      />
                    </>
                  ) : step === 1 ? (
                    <>
                      <Field
                        label="Display name"
                        value={profile.name === "Your name" ? "" : profile.name}
                        onChange={(name) => setProfile({ ...profile, name })}
                        placeholder="What should neighbors call you?"
                      />
                      <Field
                        label="City, ZIP, or approximate area"
                        value={profile.area}
                        onChange={(area) => setProfile({ ...profile, area })}
                        placeholder="For example: Aiken, SC or 29801"
                      />
                      <Text style={s.label}>How can you help?</Text>
                      <View style={s.wrap}>
                        {(["Local", "Remote", "Local & Remote"] as const).map(
                          (x) => (
                            <Chip
                              key={x}
                              label={x}
                              active={profile.serviceReach === x}
                              onPress={() =>
                                setProfile({ ...profile, serviceReach: x })
                              }
                            />
                          ),
                        )}
                      </View>
                      <Field
                        label="Your experience & approach"
                        value={profile.bio}
                        onChange={(bio) => setProfile({ ...profile, bio })}
                        multiline
                        placeholder="Tell people about your skills and how you like to work."
                      />
                      <Button
                        label={
                          showPersonal
                            ? "Hide working style and interests"
                            : "Add working style & interests"
                        }
                        secondary
                        onPress={() => setShowPersonal(!showPersonal)}
                      />
                      {showPersonal && (
                        <PersonalFields
                          profile={profile}
                          onChange={setProfile}
                        />
                      )}
                      <Text style={s.label}>Usually available</Text>
                      <View style={s.wrap}>
                        {["Weekdays", "Evenings", "Weekends", "Flexible"].map(
                          (x) => (
                            <Chip
                              key={x}
                              label={x}
                              active={profile.availability === x}
                              onPress={() =>
                                setProfile({ ...profile, availability: x })
                              }
                            />
                          ),
                        )}
                      </View>
                      {profile.serviceReach !== "Remote" && (
                        <>
                          <Text style={s.label}>Comfortable travel radius</Text>
                          <View style={s.wrap}>
                            {[
                              "5 miles",
                              "10 miles",
                              "20 miles",
                              "30 miles",
                              "50 miles",
                            ].map((x) => (
                              <Chip
                                key={x}
                                label={x}
                                active={profile.radius === x}
                                onPress={() =>
                                  setProfile({ ...profile, radius: x })
                                }
                              />
                            ))}
                          </View>
                        </>
                      )}
                      <Note
                        title="Community membership is optional"
                        text="Next, you can join a recommended community or skip it. Your location never assigns a community."
                        icon="users"
                      />
                      <Note
                        title="Share an area, not your address"
                        text="Your exact location is not needed to build a profile. This prototype keeps your changes on this device."
                        icon="map-pin"
                      />
                      <View style={s.between}>
                        <Button
                          label="Back"
                          secondary
                          onPress={() => setStep(0)}
                        />
                        <Button
                          label="Continue"
                          disabled={
                            !profile.name.trim() ||
                            profile.name === "Your name" ||
                            !profile.area.trim()
                          }
                          onPress={() => setStep(2)}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={s.h3}>Find your community</Text>
                      <Text style={s.body}>
                        Join people you identify with. These suggestions use
                        what you provide and your interests; distance is only
                        one optional signal.
                      </Text>
                      {state.communities.slice(0, 3).map((community) => {
                        const matches = community.specialties.filter((x) =>
                          profile.skills.includes(x),
                        );
                        return (
                          <Card key={community.id} style={{ gap: 10 }}>
                            <View style={s.between}>
                              <Text style={s.h3}>{community.name}</Text>
                              <Text style={s.small}>
                                Level {community.level}
                              </Text>
                            </View>
                            <Text style={s.small}>
                              {matches.length
                                ? `Matches ${matches.slice(0, 3).join(", ").toLowerCase()}.`
                                : community.description}
                            </Text>
                            <Button
                              label={
                                community.membershipType === "approval"
                                  ? "Request to join & finish"
                                  : "Join & finish"
                              }
                              secondary
                              onPress={() =>
                                saveProfileWithCommunity(community.id)
                              }
                            />
                          </Card>
                        );
                      })}
                      <View style={s.between}>
                        <Button
                          label="Back"
                          secondary
                          onPress={() => setStep(1)}
                        />
                        <Button
                          label="Skip for now"
                          onPress={() => saveProfileWithCommunity()}
                        />
                      </View>
                    </>
                  )}
                </>
              )}
              {modal === "help" && (
                <>
                  <Note
                    title="An honest preview"
                    text="All people, reviews, distances, and existing contribution counts are illustrative. There is no identity verification, live messaging, or moderation service connected."
                    icon="eye"
                  />
                  {[
                    [
                      "Contribution",
                      "Karma recognizes confirmed help. It is not currency, a background check, or proof of competence.",
                    ],
                    [
                      "Relevant experience",
                      "Read what someone can do, clarify the task, and check any qualifications relevant to your job. Self-described experience is labeled as such.",
                    ],
                    [
                      "Clear agreements",
                      "Write down both jobs, effort expectations, materials, timing, and exclusions. Extra work needs a new agreement.",
                    ],
                    [
                      "Your choice",
                      "You can decline without a karma penalty, keep your address private, or block a profile.",
                    ],
                    [
                      "When something goes wrong",
                      "Stop the work and clarify the issue. In this prototype, reports are stored locally only; no moderator will receive them.",
                    ],
                  ].map(([title, text]) => (
                    <View key={title} style={{ gap: 7 }}>
                      <Text style={s.h3}>{title}</Text>
                      <Text style={s.body}>{text}</Text>
                    </View>
                  ))}
                </>
              )}
              {modal === "report" && (
                <>
                  <Text style={s.body}>Concern about {member.name}</Text>
                  <Note
                    title="Local report demonstration"
                    text="This form saves on your device. It does not contact a moderator or emergency service."
                  />
                  <Field
                    label="Describe the concern"
                    value={reportReason}
                    onChange={setReportReason}
                    multiline
                    placeholder="What happened or what needs attention?"
                  />
                  <Button
                    label="Save local report"
                    disabled={reportReason.trim().length < 8}
                    onPress={() => {
                      setState((p) => ({
                        ...p,
                        reports: [
                          ...p.reports,
                          { memberId: member.id, reason: reportReason.trim() },
                        ],
                      }));
                      setModal(null);
                      notify(
                        "Report saved locally. No moderator was notified.",
                      );
                    }}
                  />
                </>
              )}
              {modal === "reset" && (
                <>
                  <Text style={s.body}>
                    This removes your saved demo profile, proposals, messages,
                    bookmarks, and circle choices from this device. It cannot be
                    undone.
                  </Text>
                  <Button
                    label="Keep my data"
                    secondary
                    onPress={() => setModal(null)}
                  />
                  <Button
                    label="Reset everything locally"
                    danger
                    onPress={() => {
                      setState(initialState);
                      setConversation(members[0].id);
                      setModal(null);
                      setTab("Discover");
                      notify("Demo data reset. You have a fresh start.");
                    }}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
