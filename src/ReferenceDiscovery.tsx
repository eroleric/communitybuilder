import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { C, Card, Chip, Icon, s } from "./ui";
import { Member, State, members } from "./data";

type Props = {
  state: State;
  onOpen: (member: Member) => void;
  onSave: (id: string) => void;
  onProfile: () => void;
  onCommunity: () => void;
  onMessage: (member: Member) => void;
  onHelp: () => void;
};

const portraitIndex: Record<string, number> = {
  marcus: 0,
  sofia: 1,
  james: 2,
  amara: 3,
  daniel: 4,
  leila: 5,
};

const categories = [
  ["Home & Repairs", "tool", "#E8F2FF", "Home repairs"],
  ["Gardening & Outdoors", "feather", "#E5F6EA", "Gardening"],
  ["Tech Support", "monitor", "#E9F0FB", "Technical help"],
  ["Learning & Tutoring", "book-open", "#FFF2D7", "Tutoring"],
  ["Health & Wellness", "heart", "#FBE5E5", ""],
  ["Pets & Animals", "heart", "#F3EEE5", "Pet care"],
  ["Cooking & Food", "coffee", "#E3F3F6", "Cooking"],
  ["Arts & Creative", "edit-3", "#FFF0D6", "Design"],
  ["More", "more-horizontal", "#EEF1F4", ""],
] as const;

function SpritePhoto({
  source,
  panels,
  index,
  width,
  height,
  panelAspect = 1,
}: {
  source: any;
  panels: number;
  index: number;
  width: number;
  height: number;
  panelAspect?: number;
}) {
  const imageHeight = width / panelAspect;
  return (
    <View style={{ width, height, overflow: "hidden" }}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: width * panels,
          height: imageHeight,
          left: -index * width,
          top: -(imageHeight - height) / 2,
        }}
      />
    </View>
  );
}

function GridSpritePhoto({
  source,
  columns,
  index,
  panelAspect = 1,
  width,
  height,
  focalY = 0.5,
}: {
  source: any;
  columns: number;
  index: number;
  panelAspect?: number;
  width: number;
  height: number;
  focalY?: number;
}) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const panelHeight = width / panelAspect;
  const rows = 2;
  const excess = Math.max(0, panelHeight - height);
  return (
    <View style={{ width, height, overflow: "hidden" }}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: width * columns,
          height: panelHeight * rows,
          left: -column * width,
          top: -row * panelHeight - excess * focalY,
        }}
      />
    </View>
  );
}

function SectionTitle({ title, action }: { title: string; action?: () => void }) {
  return (
    <View style={[s.between, { flexWrap: "nowrap" }]}>
      <Text style={[s.h2, { fontSize: 22 }]}>{title}</Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={action} style={[s.row, s.softAction]}>
          <Text style={s.link}>See all</Text>
          <Icon name="arrow-right" size={17} />
        </Pressable>
      )}
    </View>
  );
}

export function ReferenceDiscovery({
  state,
  onOpen,
  onSave,
  onProfile,
  onCommunity,
  onMessage,
  onHelp,
}: Props) {
  const { width } = useWindowDimensions();
  const desktop = width >= 980;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const cardWidth = desktop ? 260 : 244;
  const visibleMembers = useMemo(() => {
    const term = `${query} ${category}`.trim().toLowerCase();
    const filtered = members.filter(
      (member) =>
        !state.blocked.includes(member.id) &&
        (!term ||
          `${member.name} ${member.offers.join(" ")} ${member.wants.join(" ")} ${member.interests.join(" ")}`
            .toLowerCase()
            .includes(term)),
    );
    return showAll ? filtered : filtered.slice(0, 4);
  }, [category, desktop, query, showAll, state.blocked]);

  const offers = [
    {
      title: "Furniture repair",
      detail: members.find((member) => member.id === "james")?.examples[1] || "Repair a wooden chair",
      meta: "Local",
    },
    {
      title: "A dozen fresh eggs",
      detail: "Collected this week · bring a carton",
      meta: "Local",
    },
    {
      title: "Conversational French",
      detail: "An hour at a pace that suits you",
      meta: "Remote",
    },
  ];

  return (
    <View style={{ gap: desktop ? 28 : 20 }}>
      <View style={{ minHeight: desktop ? 370 : 286, borderRadius: 24, overflow: "hidden" }}>
        <Image
          source={
            desktop
              ? require("../assets/community-group-hero.png")
              : require("../assets/community-group-hero-mobile.png")
          }
          resizeMode={desktop ? "cover" : "stretch"}
          style={{ position: "absolute", width: "100%", height: "100%", left: 0, top: 0 }}
        />
        <View
          style={{
            flex: 1,
            padding: desktop ? 34 : 22,
            justifyContent: "center",
            backgroundColor: "rgba(7,31,23,.24)",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontFamily: "Georgia",
              fontWeight: "700",
              fontSize: desktop ? 46 : 34,
              lineHeight: desktop ? 49 : 37,
              maxWidth: desktop ? 520 : 350,
              letterSpacing: -1,
            }}
          >
            Real People.{"\n"}Real Skills.{"\n"}A Stronger Tomorrow.
          </Text>
          <Text style={[s.body, { color: "#fff", maxWidth: 430, marginTop: 12, fontSize: 16 }]}>
            Share skills, get help, exchange resources, and build meaningful connections—locally and beyond.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCategory("")}
            style={[s.row, { alignSelf: "flex-start", marginTop: 16, paddingHorizontal: 22, minHeight: 48, borderRadius: 24, backgroundColor: "#F1F8E9" }]}
          >
            <Text style={[s.bold, { color: C.green, fontSize: 15 }]}>Find People & Skills</Text>
            <Icon name="arrow-right" />
          </Pressable>
        </View>
      </View>

      <View style={[s.row, { alignItems: "stretch" }]}>
        <View style={[s.search, { minHeight: 56 }]}>
          <Icon name="search" size={23} color="#11283B" />
          <TextInput
            accessibilityLabel="Search skills and people"
            value={query}
            onChangeText={setQuery}
            placeholder="What do you need help with?"
            placeholderTextColor="#637184"
            style={s.searchInput}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show filters"
          accessibilityState={{ expanded: showFilters }}
          onPress={() => setShowFilters(!showFilters)}
          style={s.filterButton}
        >
          <Icon name="sliders" size={23} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: desktop ? 18 : 14, paddingHorizontal: 2 }}>
        {categories.map(([label, icon, color, value]) => {
          const selected = value && category === value;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: !!selected }}
              onPress={() => value ? setCategory(selected ? "" : value) : setShowFilters(true)}
              style={{ width: desktop ? 96 : 82, alignItems: "center", gap: 8 }}
            >
              <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: selected ? C.green : color, alignItems: "center", justifyContent: "center" }}>
                <Icon name={icon as any} size={28} color={selected ? "#fff" : label === "Health & Wellness" ? "#C4493B" : "#173044"} />
              </View>
              <Text style={[s.small, { color: C.ink, fontSize: 12, lineHeight: 15, textAlign: "center", fontWeight: "600" }]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showFilters && (
        <Card style={{ gap: 12 }}>
          <Text style={s.bold}>Browse every skill</Text>
          <View style={s.wrap}>
            {[...new Set(members.flatMap((member) => member.offers))].map((skill) => (
              <Chip key={skill} label={skill} active={category === skill} onPress={() => setCategory(category === skill ? "" : skill)} />
            ))}
          </View>
        </Card>
      )}

      <Pressable accessibilityRole="button" onPress={onCommunity} style={[s.between, { padding: 18, borderRadius: 20, backgroundColor: "#E2F3E7", flexWrap: "nowrap" }]}>
        <View style={[s.row, { flex: 1 }]}>
          <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: "#C5EBD5", alignItems: "center", justifyContent: "center" }}>
            <Icon name="users" size={30} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.h2, { fontSize: 20 }]}>Join a Community</Text>
            <Text style={s.body}>Connect through shared interests, skills, or causes.</Text>
          </View>
        </View>
        {desktop && (
          <View style={[s.row, s.softAction, { backgroundColor: "#fff" }]}>
            <Text style={s.link}>Explore Communities</Text>
            <Icon name="arrow-right" />
          </View>
        )}
      </Pressable>

      <View style={{ gap: 12 }}>
        <View style={[s.between, { flexWrap: desktop ? "nowrap" : "wrap" }]}>
          <View style={[s.row, { flexWrap: "wrap", gap: 10 }]}>
            <Text style={[s.h2, { fontSize: 22 }]}>People Near You</Text>
            {desktop && <Text style={s.small}>Skilled neighbors and community members within 20 miles</Text>}
          </View>
          <View style={[s.row, { marginLeft: desktop ? "auto" : 0 }]}>
            <Icon name="map-pin" size={17} />
            <Text style={s.small}>Within 20 miles</Text>
            <Pressable accessibilityRole="button" onPress={() => setShowAll(!showAll)} style={[s.row, s.softAction]}>
              <Text style={s.link}>{showAll ? "Show less" : "See all"}</Text>
              <Icon name="arrow-right" size={16} />
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 4 }}>
          {visibleMembers.map((member) => {
            const community = state.communities.find((item) => item.id === member.communityId);
            return (
            <View key={member.id} style={{ width: cardWidth, borderRadius: 15, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, shadowColor: "#102219", shadowOpacity: .08, shadowRadius: 12, elevation: 3 }}>
              <View>
                <Pressable accessibilityRole="button" accessibilityLabel={`View ${member.name}`} onPress={() => onOpen(member)}>
                  <GridSpritePhoto
                    source={require("../assets/member-portraits-grid.png")}
                    columns={3}
                    index={portraitIndex[member.id]}
                    width={cardWidth}
                    height={150}
                    focalY={0.24}
                  />
                </Pressable>
                <View style={{ position: "absolute", left: 10, bottom: 9, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 13, backgroundColor: C.green }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#7EE2AD" }} />
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>Online</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`${state.saved.includes(member.id) ? "Unsave" : "Save"} ${member.name}`} onPress={() => onSave(member.id)} style={{ position: "absolute", right: 9, top: 9, width: 34, height: 34, borderRadius: 17, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#102219", shadowOpacity: .12, shadowRadius: 5 }}>
                  <Icon name="heart" size={18} color={state.saved.includes(member.id) ? "#C4493B" : "#18384A"} />
                </Pressable>
              </View>
              <View style={{ padding: 11, gap: 7 }}>
                <View style={[s.between, { flexWrap: "nowrap" }]}>
                  <Pressable accessibilityRole="button" onPress={() => onOpen(member)} style={{ flex: 1, minWidth: 0 }}><Text style={[s.bold, { fontSize: 16 }]} numberOfLines={1}>{member.name}</Text></Pressable>
                  <View style={[s.row, { gap: 4, flexShrink: 0 }]}>
                    <Text style={{ color: "#F2A900", fontSize: 16 }}>★</Text>
                    <Text style={[s.small, { color: C.ink }]}>{(4.6 + Math.min(member.karma, 40) / 100).toFixed(1)} ({member.trades})</Text>
                  </View>
                </View>
                <Text style={[s.small, { color: C.muted, fontSize: 12.5 }]} numberOfLines={1}>
                  {member.locationLabel} · {community?.name || "Independent neighbor"}
                </Text>
                {[
                  ["Helps:", member.offers, "#E7F5EC", "#164F3E"],
                  ["Needs:", member.wants, "#FFF0E9", "#98452D"],
                  ["Interested:", member.interests, "#EDF2F7", "#274257"],
                ].map(([label, items, backgroundColor, color]) => {
                  const values = items as string[];
                  return (
                    <View key={label as string} style={[s.row, { gap: 5, alignItems: "center" }]}>
                      <Text style={[s.small, { width: 65, flexShrink: 0, color: C.ink, fontWeight: "600" }]} numberOfLines={1}>{label as string}</Text>
                      <View style={[s.row, { flex: 1, gap: 4, overflow: "hidden" }]}>
                        {values.slice(0, 2).map((value) => (
                          <View key={value} style={{ maxWidth: 75, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: backgroundColor as string }}>
                            <Text style={[s.small, { color: color as string, fontSize: 10 }]} numberOfLines={1}>{value}</Text>
                          </View>
                        ))}
                        {values.length > 2 && <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: "#E8EEF4" }}><Text style={[s.small, { color: "#274257", fontSize: 10 }]}>+{values.length - 2}</Text></View>}
                      </View>
                    </View>
                  );
                })}
                <Pressable accessibilityRole="button" onPress={() => onOpen(member)} style={[s.row, { marginTop: 3, minHeight: 42, justifyContent: "center", borderRadius: 12, backgroundColor: "#EAF5EF" }]}>
                  <Text style={s.link}>View profile</Text>
                  <Icon name="arrow-right" size={16} />
                </Pressable>
              </View>
            </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ gap: 12 }}>
        <SectionTitle title="Featured Offers" action={onHelp} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 4 }}>
          {offers.map((offer, index) => (
            <Pressable key={offer.title} accessibilityRole="button" onPress={onProfile} style={{ width: desktop ? 330 : 268, borderRadius: 17, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line }}>
              <View>
                <SpritePhoto source={require("../assets/featured-offers.png")} panels={3} index={index} width={desktop ? 330 : 268} height={112} />
                <View style={{ position: "absolute", left: 10, top: 10, backgroundColor: C.green, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 }}><Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Offer</Text></View>
              </View>
              <View style={{ padding: 13, gap: 4 }}>
                <Text style={s.h3}>{offer.title}</Text>
                <Text style={s.body}>{offer.detail}</Text>
                <View style={s.row}><Icon name="map-pin" size={14} color="#637184" /><Text style={s.small}>{offer.meta}</Text></View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: 12 }}>
        <SectionTitle title="Communities" action={onCommunity} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
          {state.communities.map((community, index) => (
            <Pressable key={community.id} accessibilityRole="button" onPress={onCommunity} style={{ width: desktop ? 210 : 154, borderRadius: 15, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line }}>
              <GridSpritePhoto
                source={require("../assets/community-thumbnails-grid.png")}
                columns={2}
                index={index % 4}
                panelAspect={1.5}
                width={desktop ? 210 : 154}
                height={86}
                focalY={0.45}
              />
              <View style={{ padding: 10, gap: 3 }}><Text style={s.bold} numberOfLines={1}>{community.name}</Text><Text style={s.small}>{community.memberCount.toLocaleString()} members</Text></View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Pressable accessibilityRole="button" onPress={onProfile} style={[s.between, { padding: 18, borderRadius: 20, backgroundColor: "#FFF3D9", flexWrap: "nowrap" }]}>
        <View style={[s.row, { flex: 1 }]}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFE4B7", alignItems: "center", justifyContent: "center" }}><Icon name="repeat" size={27} /></View>
          <View style={{ flex: 1 }}><Text style={[s.h3, { fontFamily: "Georgia" }]}>Small exchanges. Big impact.</Text><Text style={s.small}>Skills, time, and kindness go a long way.</Text></View>
        </View>
        {desktop && <View style={[s.row, { backgroundColor: C.green, paddingHorizontal: 22, minHeight: 44, borderRadius: 22 }]}><Text style={{ color: "#fff", fontWeight: "700" }}>Get Involved</Text><Icon name="arrow-right" color="#fff" /></View>}
      </Pressable>
    </View>
  );
}
