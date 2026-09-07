import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  members,
  Member,
  Profile,
  State,
  interestOptions,
  workStyles,
  skills,
} from "./data";
import { s, C, Icon, Button, Chip, Card, Field, Empty } from "./ui";
import { getCommunity } from "./communityData";

export function NeighborDiscovery({
  state,
  onOpen,
  onSave,
  onProfile,
  onCommunity,
  onMessage,
  onHelp,
}: {
  state: State;
  onOpen: (m: Member) => void;
  onSave: (id: string) => void;
  onProfile: () => void;
  onCommunity: () => void;
  onMessage: (m: Member) => void;
  onHelp: () => void;
}) {
  const wide = useWindowDimensions().width >= 980;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(false);
  const [category, setCategory] = useState("All services");
  const [saved, setSaved] = useState(false);
  const defaultRadius = 20;
  const [distance, setDistance] = useState(defaultRadius);
  const [available, setAvailable] = useState("Any time");
  const [remote, setRemote] = useState(false);
  const reciprocal = (m: Member) =>
    m.wants.some((w) => state.profile.skills.includes(w)) &&
    state.profile.wants.some((wanted) => m.offers.includes(wanted));
  const isRemoteOffer = (member: Member, offer: string) =>
    member.offerReach[offer] === "Remote" ||
    member.offerReach[offer] === "Local & Remote";
  const reachableOffers = (member: Member) =>
    member.offers.filter(
      (offer) => member.distance <= distance || isRemoteOffer(member, offer),
    );
  const list = members
    .filter(
      (m) =>
        !state.blocked.includes(m.id) &&
        (!saved || state.saved.includes(m.id)) &&
        (category === "All services"
          ? reachableOffers(m).length > 0
          : reachableOffers(m).includes(category)) &&
        (available === "Any time" || m.available === available) &&
        (!remote ||
          reachableOffers(m).some((offer) => isRemoteOffer(m, offer))) &&
        `${m.name} ${reachableOffers(m).join(" ")} ${m.examples.join(" ")} ${m.interests.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      const score = (member: Member) =>
        Number(reciprocal(member)) * 100 +
        Number(member.available === "This week") * 4 +
        Number(
          !!state.profile.primaryCommunityId &&
            member.communityIds.includes(state.profile.primaryCommunityId),
        ) *
          2 -
        (reachableOffers(member).some((offer) => isRemoteOffer(member, offer))
          ? 0
          : member.distance);
      return score(b) - score(a);
    });
  const serviceOptions = [
    "All services",
    ...new Set(members.flatMap((member) => member.offers)),
  ];
  const shortcuts: { label: string; value: string; icon: any }[] = [
    { label: "All", value: "All services", icon: "grid" },
    { label: "Tutoring", value: "Tutoring", icon: "book-open" },
    { label: "Plumbing", value: "Plumbing", icon: "tool" },
    { label: "Gardening", value: "Gardening", icon: "feather" },
    { label: "Tech help", value: "Technical help", icon: "monitor" },
    { label: "Pet care", value: "Pet care", icon: "heart" },
    { label: "Home repairs", value: "Home repairs", icon: "home" },
  ];
  return (
    <View style={{ gap: wide ? 30 : 22 }}>
      <ImageBackground
        source={require("../assets/community-hero.png")}
        resizeMode="cover"
        imageStyle={{ borderRadius: 24 }}
        style={{
          minHeight: wide ? 370 : 340,
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flex: 1,
            padding: wide ? 34 : 24,
            justifyContent: "center",
            gap: 14,
            backgroundColor: "rgba(5,38,27,.18)",
          }}
        >
          <Text style={[s.eyebrow, { color: "#CDEAD5" }]}>
            SKILLS · PEOPLE · STRONGER NEIGHBOURS
          </Text>
          <Text
            style={[
              s.heading,
              {
                color: "#fff",
                fontSize: wide ? 48 : 36,
                lineHeight: wide ? 53 : 41,
                maxWidth: 520,
              },
            ]}
          >
            Good people build brighter communities.
          </Text>
          <Text
            style={[s.body, { color: "#F0F7F2", maxWidth: 440, fontSize: 16 }]}
          >
            Share what you know. Find a hand when you need one. Build real trust
            close to home.
          </Text>
          <View style={[s.wrap, { marginTop: 4 }]}>
            <Button
              label="Find people nearby"
              icon="arrow-right"
              onPress={() => setCategory("All services")}
            />
            <Pressable
              accessibilityRole="button"
              onPress={onHelp}
              style={{
                minHeight: 46,
                paddingHorizontal: 18,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                How it works
              </Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
      <View style={{ gap: 12 }}>
        <View style={s.search}>
          <Icon name="search" />
          <TextInput
            accessibilityLabel="Search skills, people, or interests"
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="What could you use a hand with?"
            placeholderTextColor="#7e887f"
          />
          {!!query && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
              style={s.iconButton}
            >
              <Icon name="x" />
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Show filters"
            accessibilityState={{ expanded: filter }}
            onPress={() => setFilter(!filter)}
            style={s.iconButton}
          >
            <Icon name="sliders" />
          </Pressable>
        </View>
        <View style={s.wrap}>
          {shortcuts.map((x) => (
            <Chip
              key={x.label}
              label={x.label}
              icon={x.icon}
              active={category === x.value}
              onPress={() => setCategory(x.value)}
            />
          ))}
          <Chip
            label="More"
            icon="more-horizontal"
            active={!shortcuts.some((x) => x.value === category)}
            onPress={() => setFilter(true)}
          />
        </View>
      </View>
      {filter && (
        <Card style={{ gap: 15 }}>
          <Text style={s.bold}>A few preferences</Text>
          <View style={s.wrap}>
            {[5, 10, 20, 30, 50].map((x) => (
              <Chip
                key={x}
                label={`Within ${x} miles`}
                active={distance === x}
                onPress={() => setDistance(x)}
              />
            ))}
          </View>
          <View style={s.wrap}>
            {["Any time", "This week", "Weekends"].map((x) => (
              <Chip
                key={x}
                label={x}
                active={available === x}
                onPress={() => setAvailable(x)}
              />
            ))}
          </View>
          <View style={s.wrap}>
            <Chip
              label="Remote services"
              active={remote}
              onPress={() => setRemote(!remote)}
            />
            {serviceOptions.slice(1).map((x) => (
              <Chip
                key={x}
                label={x}
                active={category === x}
                onPress={() => setCategory(x)}
              />
            ))}
          </View>
          <Button
            secondary
            label="Clear preferences"
            onPress={() => {
              setCategory("All services");
              setAvailable("Any time");
              setDistance(defaultRadius);
              setRemote(false);
            }}
          />
        </Card>
      )}
      <View style={s.between}>
        <View style={{ gap: 4 }}>
          <Text style={s.h2}>
            {saved ? "People you saved" : "People nearby"}
          </Text>
          <Text style={s.small}>
            {list.length} people · local within {distance} miles + remote
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          onPress={() => setSaved(!saved)}
          style={[s.row, s.softAction]}
        >
          <Icon name="bookmark" size={16} />
          <Text style={s.link}>{saved ? "Show everyone" : "Saved"}</Text>
        </Pressable>
      </View>
      <View style={{ gap: 14 }}>
        {list.map((m) => {
          const common = m.interests.filter((x) =>
            state.profile.interests.includes(x),
          );
          return (
            <Card
              key={m.id}
              style={{ width: "100%", gap: 13, padding: wide ? 22 : 16 }}
            >
              <View style={s.row}>
                <View
                  style={[
                    s.avatar,
                    {
                      backgroundColor: m.color,
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                    },
                  ]}
                >
                  <Text style={s.h3}>{m.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.row}>
                    <Text style={s.h3}>{m.name}</Text>
                    <Icon name="check-circle" size={16} color="#27956A" />
                  </View>
                  <Text style={s.small}>
                    {m.locationLabel} ·{" "}
                    {state.profile.primaryCommunityId &&
                    m.communityId === state.profile.primaryCommunityId
                      ? `Your community · ${getCommunity(state.profile.primaryCommunityId, state.communities)?.name}`
                      : getCommunity(m.communityId, state.communities)
                        ? `${getCommunity(m.communityId, state.communities)?.name} · Level ${getCommunity(m.communityId, state.communities)?.level}`
                        : "Independent member"}
                  </Text>
                </View>
                <View style={{ gap: 7, alignItems: "flex-end" }}>
                  <View
                    style={{
                      backgroundColor: "#E2F6E9",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: C.green,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      ● Available
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${state.saved.includes(m.id) ? "Unsave" : "Save"} ${m.name}`}
                    onPress={() => onSave(m.id)}
                  >
                    <Icon
                      name="bookmark"
                      size={18}
                      color={state.saved.includes(m.id) ? C.gold : "#899386"}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={[s.wrap, { gap: 12 }]}>
                <View style={s.row}>
                  <Icon name="star" size={16} color="#D49A2D" />
                  <Text style={s.small}>
                    {(4.6 + Math.min(m.karma, 40) / 100).toFixed(1)} (
                    {m.trades + m.karma})
                  </Text>
                </View>
                <View style={s.row}>
                  <Icon name="message-circle" size={15} />
                  <Text style={s.small}>
                    Usually responds within{" "}
                    {m.id === "leila"
                      ? "1"
                      : Math.max(1, Math.round(m.distance))}
                    h
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: wide ? "row" : "column", gap: 10 }}>
                <View style={[s.capabilitySection, { flex: 1 }]}>
                  <View style={s.sectionHeader}>
                    <Icon name="tool" size={15} color={C.green} />
                    <Text style={[s.eyebrow, s.capabilityEyebrow]}>
                      CAN HELP WITH
                    </Text>
                  </View>
                  <View style={s.wrap}>
                    {reachableOffers(m).map((offer) => (
                      <View style={s.serviceTag} key={offer}>
                        <Text style={s.serviceTagText}>
                          {offer}
                          {isRemoteOffer(m, offer) ? " · Remote" : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[s.requestSection, { flex: 1 }]}>
                  <View style={s.sectionHeader}>
                    <Icon name="search" size={15} color="#805D2A" />
                    <Text style={[s.eyebrow, s.requestEyebrow]}>
                      COULD USE HELP WITH
                    </Text>
                  </View>
                  <View style={s.wrap}>
                    {m.wants.map((wanted) => (
                      <View style={s.needTag} key={wanted}>
                        <Text style={s.needTagText}>{wanted}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={[s.body, { color: C.muted }]} numberOfLines={2}>
                {m.about}
              </Text>
              {reciprocal(m) && (
                <View style={s.match}>
                  <Icon name="repeat" size={15} />
                  <Text style={[s.small, { color: C.green, flex: 1 }]}>
                    You could help each other:{" "}
                    {m.offers
                      .filter((offer) => state.profile.wants.includes(offer))
                      .join(", ")
                      .toLowerCase()}{" "}
                    ↔{" "}
                    {m.wants
                      .filter((x) => state.profile.skills.includes(x))
                      .join(", ")
                      .toLowerCase()}
                  </Text>
                </View>
              )}
              <View
                style={[
                  s.between,
                  { borderTopWidth: 1, borderColor: C.line, paddingTop: 12 },
                ]}
              >
                <Pressable accessibilityRole="button" onPress={() => onOpen(m)}>
                  <Text style={s.link}>Review profile →</Text>
                </Pressable>
                <Button
                  label="Message"
                  icon="message-circle"
                  onPress={() => onMessage(m)}
                />
              </View>
            </Card>
          );
        })}
      </View>
      {!list.length && (
        <Empty
          title="Nobody here just yet"
          text="Try another skill or widen your search. A good connection may be a little further away."
          action={
            <Button
              label="Show all neighbors"
              secondary
              onPress={() => {
                setQuery("");
                setCategory("All services");
                setAvailable("Any time");
                setDistance(defaultRadius);
                setRemote(false);
                setSaved(false);
              }}
            />
          }
        />
      )}
      <View style={{ flexDirection: wide ? "row" : "column", gap: 14 }}>
        <Card style={{ flex: 1, gap: 12, backgroundColor: "#FFFAF0" }}>
          <View style={s.row}>
            <Icon name="zap" color="#C47A20" />
            <View>
              <Text style={s.h3}>Happening now</Text>
              <Text style={s.small}>Real activity from the community</Text>
            </View>
          </View>
          {[
            ["James asked for help with plumbing", "12 min ago · South Orange"],
            ["Amara offered tutoring in math", "28 min ago · Maplewood"],
            ["New pet-care request nearby", "1 hour ago · Maplewood"],
          ].map(([title, meta]) => (
            <View
              key={title}
              style={[
                s.between,
                { borderTopWidth: 1, borderColor: "#EAE2D2", paddingTop: 10 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.bold}>{title}</Text>
                <Text style={s.small}>{meta}</Text>
              </View>
              <Icon name="chevron-right" />
            </View>
          ))}
        </Card>
        <View
          style={{
            flex: 1,
            borderRadius: 20,
            backgroundColor: "#173D2E",
            padding: 22,
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Icon name="sun" size={28} color="#CBEA9D" />
          <Text style={[s.h2, { color: "#fff" }]}>
            Small skills. Big impact.
          </Text>
          <Text style={[s.body, { color: "#D8E7DC" }]}>
            Every useful connection makes the whole community more capable.
          </Text>
          <Button
            label="Build your profile"
            icon="arrow-right"
            onPress={onProfile}
          />
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <View style={s.between}>
          <View>
            <Text style={s.h2}>Community circles</Text>
            <Text style={s.small}>
              Meet people who share your interests and values
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onCommunity}
            style={s.softAction}
          >
            <Text style={s.link}>See all →</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {state.communities.map((community, index) => (
            <Pressable
              key={community.id}
              accessibilityRole="button"
              onPress={onCommunity}
              style={{
                width: 190,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: C.line,
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 68,
                  padding: 14,
                  justifyContent: "flex-end",
                  backgroundColor: ["#315E48", "#795B3B", "#547B58", "#50667A"][
                    index % 4
                  ],
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}
                >
                  {community.icon}
                </Text>
              </View>
              <View style={{ padding: 12, gap: 3 }}>
                <Text style={s.bold}>{community.name}</Text>
                <Text style={s.small}>
                  {community.memberCount.toLocaleString()} members
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View
        style={[
          s.between,
          { paddingVertical: 20, borderTopWidth: 1, borderColor: C.line },
        ]}
      >
        <View style={{ flex: 1, gap: 5, minWidth: 200 }}>
          <Text style={s.bold}>
            {state.profile.onboarded
              ? "Strengthen your profile."
              : "Make your capability visible."}
          </Text>
          <Text style={s.small}>
            Add your working style and a few interests that help people connect
            with you.
          </Text>
        </View>
        <Button
          label={
            state.profile.onboarded
              ? "Add style & interests"
              : "Make your profile"
          }
          secondary
          onPress={onProfile}
        />
      </View>
      <Pressable accessibilityRole="button" onPress={onCommunity} style={s.row}>
        <Icon name="users" size={17} />
        <Text style={s.link}>Explore communities</Text>
      </Pressable>
    </View>
  );
}

export function PersonalFields({
  profile,
  onChange,
  preferences = false,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  preferences?: boolean;
}) {
  const [custom, setCustom] = useState("");
  return (
    <View style={{ gap: 16 }}>
      <Text style={s.h3}>
        {preferences ? "Good starting points" : "Working style and interests"}
      </Text>
      <Text style={s.body}>
        {preferences
          ? "Optional preferences help find people you could help in return. Change these whenever life changes."
          : "Share how you prefer to work and a few interests that can help a practical connection become a lasting one."}
      </Text>
      {preferences ? (
        <>
          <Text style={s.label}>Open to receiving help with</Text>
          <View style={s.wrap}>
            {skills.map((x) => (
              <Chip
                key={x}
                label={x}
                active={profile.wants.includes(x)}
                onPress={() =>
                  onChange({
                    ...profile,
                    wants: profile.wants.includes(x)
                      ? profile.wants.filter((y) => y !== x)
                      : [...profile.wants, x],
                  })
                }
              />
            ))}
          </View>
          <Field
            label="Tools or materials I usually bring"
            value={profile.tools}
            onChange={(tools) => onChange({ ...profile, tools })}
            multiline
            placeholder="For example: basic hand tools; parts supplied by the owner"
          />
          <Field
            label="Usual limits or things to check first"
            value={profile.exclusions}
            onChange={(exclusions) => onChange({ ...profile, exclusions })}
            multiline
            placeholder="For example: small jobs only; inspect the work before agreeing"
          />
        </>
      ) : (
        <>
          <Text style={s.label}>Interests beyond the work</Text>
          <View style={s.wrap}>
            {[...new Set([...interestOptions, ...profile.interests])].map(
              (x) => (
                <Chip
                  key={x}
                  label={x}
                  active={profile.interests.includes(x)}
                  onPress={() =>
                    onChange({
                      ...profile,
                      interests: profile.interests.includes(x)
                        ? profile.interests.filter((y) => y !== x)
                        : [...profile.interests, x],
                    })
                  }
                />
              ),
            )}
          </View>
          <Field
            label="Another interest"
            value={custom}
            onChange={setCustom}
            placeholder="Your kind of weekend…"
          />
          <Button
            label="Add interest"
            secondary
            disabled={!custom.trim()}
            onPress={() => {
              onChange({
                ...profile,
                interests: [...new Set([...profile.interests, custom.trim()])],
              });
              setCustom("");
            }}
          />
          <Text style={s.label}>Working style</Text>
          <View style={s.wrap}>
            {workStyles.map((x) => (
              <Chip
                key={x}
                label={x}
                active={profile.workingStyle === x}
                onPress={() =>
                  onChange({
                    ...profile,
                    workingStyle: profile.workingStyle === x ? "" : x,
                  })
                }
              />
            ))}
          </View>
          <Text style={s.small}>
            Keep it practical or get to know each other along the way. Either is
            welcome.
          </Text>
        </>
      )}
    </View>
  );
}
