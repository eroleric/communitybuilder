import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Community,
  CommunityMembership,
  MembershipType,
} from "./communityTypes";
import {
  communityLeaderboard,
  LeaderboardCategory,
} from "./communityProgression";
import { getCommunity } from "./communityData";
import { Member, State, gifts } from "./data";
import { Button, Card, Chip, C, Icon, Note, PageIntro, s } from "./ui";

const userId = "local-user";
const fmt = (n: number) => n.toLocaleString();

export function CommunityHub({
  state,
  setState,
  members,
  notify,
}: {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  members: Member[];
  notify: (text: string) => void;
}) {
  const compact = useWindowDimensions().width < 980;
  const [section, setSection] = useState("Home");
  const [selectedId, setSelectedId] = useState<string>();
  const [detailTab, setDetailTab] = useState("Overview");
  const [query, setQuery] = useState("");
  const [leaderboardCategory, setLeaderboardCategory] =
    useState<LeaderboardCategory>("Overall");
  const [leaderboardRange, setLeaderboardRange] = useState("This Month");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTags, setNewTags] = useState("");
  const [membershipType, setMembershipType] = useState<MembershipType>("open");
  const myMemberships = state.memberships.filter(
    (m) => m.userId === userId && m.status === "active",
  );
  const primaryMembership = myMemberships.find((m) => m.primary);
  const primary = getCommunity(
    primaryMembership?.communityId,
    state.communities,
  );
  const selected = getCommunity(selectedId, state.communities);
  const memberOf = (id: string) =>
    myMemberships.some((m) => m.communityId === id);
  const communityMembers = (id: string) =>
    members.filter((m) => m.communityIds.includes(id));
  const capabilityMap = (id: string) => {
    const grouped = new Map<string, { providers: number; requests: number }>();
    communityMembers(id).forEach((m) => {
      m.offers.forEach((name) =>
        grouped.set(name, {
          providers: (grouped.get(name)?.providers || 0) + 1,
          requests: grouped.get(name)?.requests || 0,
        }),
      );
      m.wants.forEach((name) =>
        grouped.set(name, {
          providers: grouped.get(name)?.providers || 0,
          requests: (grouped.get(name)?.requests || 0) + 1,
        }),
      );
    });
    return [...grouped.entries()].map(([name, counts]) => ({
      name,
      ...counts,
    }));
  };
  const join = (community: Community) => {
    if (memberOf(community.id)) return;
    const pending = community.membershipType === "approval";
    const membership: CommunityMembership = {
      userId,
      communityId: community.id,
      role: "member",
      joinedAt: new Date().toISOString(),
      primary: !primary && !pending,
      status: pending ? "pending" : "active",
    };
    setState((p) => ({
      ...p,
      memberships: [...p.memberships, membership],
      profile:
        !primary && !pending
          ? {
              ...p.profile,
              primaryCommunityId: community.id,
              homeCommunityId: community.id,
            }
          : p.profile,
    }));
    notify(
      pending
        ? `Join request saved for ${community.name}.`
        : `You joined ${community.name}.`,
    );
  };
  const leave = (community: Community) => {
    setState((p) => {
      const remaining = p.memberships.filter(
        (m) => !(m.userId === userId && m.communityId === community.id),
      );
      const next = remaining.find(
        (m) => m.userId === userId && m.status === "active",
      );
      const memberships = remaining.map((m) =>
        m.userId === userId
          ? { ...m, primary: m.communityId === next?.communityId }
          : m,
      );
      return {
        ...p,
        memberships,
        profile: {
          ...p.profile,
          primaryCommunityId: next?.communityId,
          homeCommunityId: next?.communityId || "",
        },
      };
    });
    notify(
      `You left ${community.name}. Your trades, trust, and messages remain.`,
    );
  };
  const makePrimary = (community: Community) => {
    setState((p) => ({
      ...p,
      memberships: p.memberships.map((m) =>
        m.userId === userId
          ? { ...m, primary: m.communityId === community.id }
          : m,
      ),
      profile: {
        ...p.profile,
        primaryCommunityId: community.id,
        homeCommunityId: community.id,
      },
    }));
    notify(`${community.name} is now your Primary Community.`);
  };
  const recommendation = (c: Community) => {
    const offerMatches = c.needs.filter((x) =>
      state.profile.skills.includes(x),
    );
    const interestMatches = c.tags.filter((x) =>
      state.profile.interests.some(
        (i) =>
          i.toLowerCase().includes(x.toLowerCase()) ||
          x.toLowerCase().includes(i.toLowerCase()),
      ),
    );
    if (offerMatches.length)
      return `Looking for ${offerMatches.slice(0, 2).join(" and ").toLowerCase()} experience`;
    if (interestMatches.length)
      return `Matches your interest in ${interestMatches[0].toLowerCase()}`;
    if (
      c.regions.some((r) => state.profile.approximateLocationLabel.includes(r))
    )
      return "Active in your region";
    const count =
      c.specialties.filter((x) => state.profile.skills.includes(x)).length || 2;
    return `Matches ${count} ${count === 1 ? "thing" : "things"} you can provide`;
  };
  const filtered = state.communities.filter((c) =>
    `${c.name} ${c.tags.join(" ")} ${c.specialties.join(" ")} ${c.needs.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const createCommunity = () => {
    const name = newName.trim();
    if (
      !name ||
      state.communities.some((c) => c.name.toLowerCase() === name.toLowerCase())
    ) {
      notify(
        name
          ? "A community with that name already exists."
          : "Add a community name first.",
      );
      return;
    }
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const tags = newTags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const community: Community = {
      id,
      name,
      icon: name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      description:
        newDescription.trim() ||
        "A community built around practical cooperation.",
      tags,
      specialties: [...state.profile.skills],
      needs: [],
      level: 1,
      memberCount: 1,
      stats: {
        confirmedContributions: 0,
        completedTrades: 0,
        activeContributorsMonth: 0,
        uniqueMembersHelped: 0,
        repeatTradeRate: 0,
        fairTradeRate: 0,
        recentActivity: 0,
        memberGrowthMonth: 0,
      },
      createdAt: new Date().toISOString(),
      leadership: {
        leader: state.profile.name,
        coLeaders: [],
        moderatorCount: 0,
      },
      rules: [
        "Keep commitments and communicate directly.",
        "Respect people, property, and privacy.",
      ],
      membershipType,
      regions: [],
    };
    const membership: CommunityMembership = {
      userId,
      communityId: id,
      role: "leader",
      joinedAt: new Date().toISOString(),
      primary: !primary,
      status: "active",
    };
    setState((p) => ({
      ...p,
      communities: [...p.communities, community],
      memberships: [...p.memberships, membership],
      profile: !primary
        ? { ...p.profile, primaryCommunityId: id, homeCommunityId: id }
        : p.profile,
    }));
    setCreating(false);
    setNewName("");
    setNewDescription("");
    setNewTags("");
    setSelectedId(id);
    notify(`${name} was created. You are its Leader.`);
  };

  const CommunityCard = ({
    community,
    reason,
  }: {
    community: Community;
    reason?: string;
  }) => (
    <Card style={{ gap: 0, padding: 0, overflow: "hidden" }}>
      <View style={{ backgroundColor: "#174B38", padding: 18 }}>
        <View style={s.between}>
          <View style={s.communityIdentity}>
            <View
              style={[
                s.communityEmblem,
                { backgroundColor: "rgba(255,255,255,.13)" },
              ]}
            >
              <Text style={[s.bold, { color: "#FCF9EF", fontSize: 17 }]}>
                {community.icon}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[s.h3, { color: "#fff" }]}>{community.name}</Text>
              <Text style={[s.small, { color: "#CDE1D4" }]}>
                Level {community.level} · {fmt(community.memberCount)} members
              </Text>
            </View>
          </View>
          {memberOf(community.id) && (
            <View style={[s.badge, { backgroundColor: "#DDF4E7" }]}>
              <Text style={[s.small, { color: C.green }]}>✓ Joined</Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ padding: 18, gap: 13 }}>
        <Text style={s.body}>{community.description}</Text>
        {reason && (
          <View
            style={[
              s.row,
              { backgroundColor: C.pale, padding: 10, borderRadius: 12 },
            ]}
          >
            <Icon name="target" size={15} />
            <Text style={[s.small, { flex: 1 }]}>{reason}</Text>
          </View>
        )}
        <View style={s.wrap}>
          {community.specialties.slice(0, 4).map((x) => (
            <View key={x} style={s.serviceTag}>
              <Text style={s.serviceTagText}>{x}</Text>
            </View>
          ))}
        </View>
        <View style={[s.wrap, s.cardActions]}>
          <Button
            label="View community"
            secondary
            onPress={() => {
              setSelectedId(community.id);
              setDetailTab("Overview");
            }}
          />
          {!memberOf(community.id) && (
            <Button
              label={
                community.membershipType === "approval"
                  ? "Request to join"
                  : "Join community"
              }
              onPress={() => join(community)}
            />
          )}
        </View>
      </View>
    </Card>
  );

  if (selected) {
    const capabilities = capabilityMap(selected.id)
      .filter((c) => c.providers > 0)
      .sort((a, b) => b.providers - a.providers);
    return (
      <View style={{ gap: 18 }}>
        <Button
          label="Back to communities"
          secondary
          icon="arrow-left"
          onPress={() => setSelectedId(undefined)}
        />
        <Card style={{ gap: 16, backgroundColor: "#edf5f0" }}>
          <Text style={s.eyebrow}>COMMUNITY</Text>
          <View style={s.row}>
            <View
              style={[
                s.avatar,
                { width: 58, height: 58, backgroundColor: "#fff" },
              ]}
            >
              <Text style={s.h3}>{selected.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[s.heading, compact && { fontSize: 29, lineHeight: 35 }]}
              >
                {selected.name}
              </Text>
              <Text style={s.body}>
                Level {selected.level} · {fmt(selected.memberCount)} members ·{" "}
                {fmt(selected.stats.confirmedContributions)} confirmed
                contributions
              </Text>
            </View>
          </View>
          <Text style={s.body}>{selected.description}</Text>
          <View style={s.wrap}>
            {!memberOf(selected.id) ? (
              <Button
                label={
                  selected.membershipType === "approval"
                    ? "Request to join"
                    : "Join community"
                }
                onPress={() => join(selected)}
              />
            ) : (
              <>
                <Button
                  label={
                    primary?.id === selected.id
                      ? "Primary Community"
                      : "Make Primary"
                  }
                  secondary={primary?.id === selected.id}
                  disabled={primary?.id === selected.id}
                  onPress={() => makePrimary(selected)}
                />
                <Button
                  label="Leave"
                  secondary
                  onPress={() => leave(selected)}
                />
              </>
            )}
          </View>
        </Card>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {["Overview", "Members", "Activity", "Leaderboard", "About"].map(
            (x) => (
              <Chip
                key={x}
                label={x}
                active={detailTab === x}
                onPress={() => setDetailTab(x)}
              />
            ),
          )}
        </ScrollView>
        {detailTab === "Overview" && (
          <>
            <Card style={{ gap: 15 }}>
              <Text style={s.h3}>Strongest capabilities</Text>
              {(capabilities.length
                ? capabilities
                : selected.specialties.map((name, i) => ({
                    name,
                    providers: Math.max(1, 12 - i * 2),
                    requests: 0,
                  }))
              )
                .slice(0, 5)
                .map((c) => (
                  <View key={c.name} style={s.between}>
                    <Text style={s.body}>{c.name}</Text>
                    <Text style={s.small}>{c.providers} providers</Text>
                  </View>
                ))}
              <View style={s.divider} />
              <Text style={s.h3}>Currently needed</Text>
              <View style={s.wrap}>
                {selected.needs.map((x) => (
                  <View key={x} style={s.needTag}>
                    <Text style={s.needTagText}>{x}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.small}>
                Based on member requests compared with available offerings.
                Listed capability does not imply credentials.
              </Text>
            </Card>
            <Card style={{ gap: 13 }}>
              <Text style={s.h3}>Community stats</Text>
              <View style={s.wrap}>
                {[
                  [fmt(selected.stats.completedTrades), "completed trades"],
                  [
                    fmt(selected.stats.activeContributorsMonth),
                    "active this month",
                  ],
                  [
                    `${selected.stats.fairTradeRate}%`,
                    "fair-trade confirmation",
                  ],
                  [`${selected.stats.repeatTradeRate}%`, "repeat-trade rate"],
                ].map(([v, l]) => (
                  <View key={l} style={[s.stats, { minWidth: 135 }]}>
                    <Text style={s.statNumber}>{v}</Text>
                    <Text style={s.small}>{l}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </>
        )}
        {detailTab === "Members" && (
          <Card style={{ gap: 14 }}>
            <Text style={s.h3}>Sample members</Text>
            {communityMembers(selected.id).length ? (
              communityMembers(selected.id).map((m) => (
                <View key={m.id} style={s.between}>
                  <View>
                    <Text style={s.bold}>{m.name}</Text>
                    <Text style={s.small}>{m.offers.join(" · ")}</Text>
                  </View>
                  <Text style={s.small}>{m.locationLabel}</Text>
                </View>
              ))
            ) : (
              <Text style={s.body}>No sample profiles are shown yet.</Text>
            )}
          </Card>
        )}
        {detailTab === "Activity" && (
          <Card style={{ gap: 16 }}>
            <Text style={s.h3}>Practical activity</Text>
            {[
              [
                "check-circle",
                `${selected.stats.completedTrades} confirmed trades completed`,
              ],
              [
                "user-plus",
                `${selected.stats.activeContributorsMonth} members contributed this month`,
              ],
              ["award", `Community reached Level ${selected.level}`],
              [
                "alert-circle",
                `Current need: ${selected.needs.slice(0, 2).join(" and ")}`,
              ],
            ].map(([icon, text]) => (
              <View style={s.row} key={text}>
                <Icon name={icon as any} />
                <Text style={s.body}>{text}</Text>
              </View>
            ))}
            <Text style={s.small}>
              Activity records cooperation and milestones. Messages, likes, and
              cancelled trades do not create progress.
            </Text>
          </Card>
        )}
        {detailTab === "Leaderboard" && (
          <Leaderboard
            communities={state.communities}
            category={leaderboardCategory}
            setCategory={setLeaderboardCategory}
            range={leaderboardRange}
            setRange={setLeaderboardRange}
            onSelect={setSelectedId}
          />
        )}
        {detailTab === "About" && (
          <>
            <Card style={{ gap: 13 }}>
              <Text style={s.h3}>Leadership</Text>
              <Text style={s.body}>Leader · {selected.leadership.leader}</Text>
              <Text style={s.body}>
                Co-Leaders ·{" "}
                {selected.leadership.coLeaders.join(", ") || "None appointed"}
              </Text>
              <Text style={s.body}>
                Moderators · {selected.leadership.moderatorCount}
              </Text>
              <Text style={s.small}>
                Leaders cannot access private messages, exact addresses, or
                unrelated trade details.
              </Text>
            </Card>
            <Card style={{ gap: 12 }}>
              <Text style={s.h3}>Community rules</Text>
              {selected.rules.map((x, i) => (
                <Text style={s.body} key={x}>
                  {i + 1}. {x}
                </Text>
              ))}
              <Text style={s.small}>
                {selected.membershipType === "open"
                  ? "Open · Anyone can join"
                  : "Approval · Join requests require approval"}
              </Text>
            </Card>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={{ gap: 20 }}>
      <PageIntro
        title="Communities"
        icon="users"
        text="Find people you want to build with. Location helps with physical work; belonging is always your choice."
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {["Home", "Discover", "Leaderboard", "Free shelf"].map((x) => (
          <Chip
            key={x}
            label={x}
            active={section === x}
            onPress={() => setSection(x)}
          />
        ))}
      </ScrollView>
      {section === "Home" && (
        <View style={{ gap: 18 }}>
          {primary ? (
            <>
              <Text style={s.h2}>Your Primary Community</Text>
              <CommunityCard community={primary} />
              <Text style={s.h2}>Your Communities</Text>
              {myMemberships
                .filter((m) => m.communityId !== primary.id)
                .map((m) => {
                  const c = getCommunity(m.communityId, state.communities);
                  return c ? <CommunityCard key={c.id} community={c} /> : null;
                })}
            </>
          ) : (
            <Note
              title="Find people you want to build with"
              text="You do not need to join a community to discover people or trade. Join when a group feels like your people."
              icon="users"
            />
          )}
          <Text style={s.h2}>Recommended Communities</Text>
          {state.communities
            .filter((c) => !memberOf(c.id))
            .slice(0, 3)
            .map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                reason={recommendation(c)}
              />
            ))}
        </View>
      )}
      {section === "Discover" && (
        <View style={{ gap: 16 }}>
          <View style={s.search}>
            <Icon name="search" />
            <TextInput
              accessibilityLabel="Search communities"
              value={query}
              onChangeText={setQuery}
              placeholder="Search focus, capability, or community"
              placeholderTextColor="#7e887f"
              style={s.searchInput}
            />
          </View>
          <Button
            label={creating ? "Cancel" : "Create Community"}
            secondary
            icon="plus"
            onPress={() => setCreating(!creating)}
          />
          {creating && (
            <Card style={{ gap: 13 }}>
              <Text style={s.h3}>Create a community</Text>
              <TextInput
                accessibilityLabel="Community name"
                style={s.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Community name"
              />
              <TextInput
                accessibilityLabel="Community description"
                style={[s.input, { minHeight: 75 }]}
                multiline
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="What brings this community together?"
              />
              <TextInput
                accessibilityLabel="Community focus"
                style={s.input}
                value={newTags}
                onChangeText={setNewTags}
                placeholder="Focus tags, separated by commas"
              />
              <View style={s.wrap}>
                {["open", "approval"].map((x) => (
                  <Chip
                    key={x}
                    label={x === "open" ? "Open" : "Approval required"}
                    active={membershipType === x}
                    onPress={() => setMembershipType(x as MembershipType)}
                  />
                ))}
              </View>
              <Button label="Create Community" onPress={createCommunity} />
            </Card>
          )}
          {filtered.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              reason={recommendation(c)}
            />
          ))}
        </View>
      )}
      {section === "Leaderboard" && (
        <Leaderboard
          communities={state.communities}
          category={leaderboardCategory}
          setCategory={setLeaderboardCategory}
          range={leaderboardRange}
          setRange={setLeaderboardRange}
          onSelect={setSelectedId}
        />
      )}
      {section === "Free shelf" && (
        <View style={{ gap: 16 }}>
          <Note
            title="Freely shared"
            text="These items ask for nothing in return. Contribution recognition is never money or exchange credit."
            icon="gift"
          />
          {gifts.map((g) => (
            <Card key={g.id} style={{ gap: 8 }}>
              <Text style={s.h3}>{g.title}</Text>
              <Text style={s.small}>{g.owner}</Text>
              <Text style={s.body}>{g.detail}</Text>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

function Leaderboard({
  communities,
  category,
  setCategory,
  range,
  setRange,
  onSelect,
}: {
  communities: Community[];
  category: LeaderboardCategory;
  setCategory: (x: LeaderboardCategory) => void;
  range: string;
  setRange: (x: string) => void;
  onSelect: (id: string) => void;
}) {
  const entries = useMemo(
    () => communityLeaderboard(communities, category),
    [communities, category],
  );
  return (
    <Card style={{ gap: 16 }}>
      <View>
        <Text style={s.h2}>Community Leaderboard</Text>
        <Text style={s.small}>
          Communities are compared using confirmed activity and normalized
          rates. Individual people are never ranked by usefulness.
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {(
          [
            "Overall",
            "Most Active",
            "Most Reliable",
            "Fastest Growing",
            "Best Trade Completion",
          ] as LeaderboardCategory[]
        ).map((x) => (
          <Chip
            key={x}
            label={x}
            active={category === x}
            onPress={() => setCategory(x)}
          />
        ))}
      </ScrollView>
      <View style={s.wrap}>
        {["This Week", "This Month", "All Time"].map((x) => (
          <Chip
            key={x}
            label={x}
            active={range === x}
            onPress={() => setRange(x)}
          />
        ))}
      </View>
      {entries.map((e) => {
        const c = getCommunity(e.communityId, communities)!;
        return (
          <View key={e.communityId} style={s.between}>
            <View style={s.row}>
              <Text style={s.statNumber}>{e.rank}</Text>
              <View>
                <Text style={s.bold}>{c.name}</Text>
                <Text style={s.small}>{e.explanation}</Text>
              </View>
            </View>
            <Button label={e.value} secondary onPress={() => onSelect(c.id)} />
          </View>
        );
      })}
      <Text style={s.small}>
        {range} view · Prototype statistics demonstrate the ranking model
        without false precision.
      </Text>
    </Card>
  );
}
