import React, { useState } from "react";
import {
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
}: {
  state: State;
  onOpen: (m: Member) => void;
  onSave: (id: string) => void;
  onProfile: () => void;
  onCommunity: () => void;
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
  return (
    <View style={{ gap: 25 }}>
      <View
        style={[
          s.heroPanel,
          { gap: 12, padding: wide ? 32 : 22, marginTop: 2 },
        ]}
      >
        <View style={s.heroMark} />
        <Text style={s.eyebrow}>PRACTICAL SKILLS. LOCAL INDEPENDENCE.</Text>
        <Text
          style={[
            s.heading,
            { fontSize: wide ? 42 : 33, lineHeight: wide ? 49 : 40 },
          ]}
        >
          Build independence through{"\n"}people you trust.
        </Text>
        <Text style={[s.body, { maxWidth: 510 }]}>
          Exchange practical skills. Build trust through action. Become more
          self-reliant, together.
        </Text>
      </View>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {serviceOptions.map((x) => (
            <Chip
              key={x}
              label={x}
              active={category === x}
              onPress={() => setCategory(x)}
            />
          ))}
        </ScrollView>
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
            {skills.slice(5).map((x) => (
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
            {saved ? "People you saved" : "Capable people nearby"}
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
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18 }}>
        {list.map((m) => {
          const common = m.interests.filter((x) =>
            state.profile.interests.includes(x),
          );
          return (
            <Card
              key={m.id}
              style={{ width: wide ? "48.5%" : "100%", gap: 17 }}
            >
              <View style={s.row}>
                <View
                  style={[
                    s.avatar,
                    {
                      backgroundColor: m.color,
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                    },
                  ]}
                >
                  <Text style={s.h3}>{m.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.h3}>{m.name}</Text>
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
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${state.saved.includes(m.id) ? "Unsave" : "Save"} ${m.name}`}
                  style={s.iconButton}
                  onPress={() => onSave(m.id)}
                >
                  <Icon
                    name="bookmark"
                    color={state.saved.includes(m.id) ? C.gold : "#899386"}
                  />
                </Pressable>
              </View>
              <View style={s.capabilitySection}>
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
              <View style={s.requestSection}>
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
              <View style={s.row}>
                <Icon name="users" size={15} />
                <Text style={[s.small, { flex: 1 }]}>
                  {common.length
                    ? `You both enjoy ${common.join(" & ").toLowerCase()}`
                    : `Also into ${m.interests.slice(0, 2).join(" · ").toLowerCase()}`}
                </Text>
              </View>
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
              <Button
                label="Review profile"
                secondary
                icon="arrow-up-right"
                onPress={() => onOpen(m)}
              />
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
