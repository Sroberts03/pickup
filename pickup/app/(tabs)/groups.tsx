import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { useServer } from "@/contexts/ServerContext";
import { useAuth } from "@/contexts/AuthContext";
import React, { useCallback, useState } from "react";
import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import { useRouter } from "expo-router";

interface GroupWithMessage {
  group: Group;
  lastMessage: GroupMessage | null;
  isUnread: boolean;
}

export default function GroupsScreen() {
  const { colors } = useTheme();
  const server = useServer();
  const { user } = useAuth();
  const router = useRouter();
  const [groupsData, setGroupsData] = useState<GroupWithMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userGroups = await server.getUserGroups(user.id);
      
      if (userGroups.length === 0) {
        setGroupsData([]);
        return;
      }
      
      const groupsWithMessages = await Promise.all(
        userGroups.map(async (group) => {
          const [lastMessage, isUnread] = await Promise.all([
            server.getLastGroupMessage(group.id),
            server.getGroupUnreadStatus(group.id),
          ]);
          return { group, lastMessage, isUnread };
        })
      );
      
      // Sort by last message date (most recent first)
      groupsWithMessages.sort((a, b) => {
        const dateA = a.lastMessage?.sentAt || a.group.createdAt;
        const dateB = b.lastMessage?.sentAt || b.group.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setGroupsData(groupsWithMessages);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setLoading(false);
    }
  }, [server, user]);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: GroupWithMessage }) => {
    const { group, lastMessage, isUnread } = item;
    
    let dateStr = "";
    let messageContent = "No messages yet";
    
    if (lastMessage) {
      const messageDate = new Date(lastMessage.sentAt);
      const now = new Date();
      const isToday = messageDate.getDate() === now.getDate() && 
                      messageDate.getMonth() === now.getMonth() && 
                      messageDate.getFullYear() === now.getFullYear();
      
      const isYesterday = new Date(now.getTime() - 86400000).getDate() === messageDate.getDate();

      if (isToday) {
        dateStr = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (isYesterday) {
        dateStr = "Yesterday";
      } else {
        dateStr = messageDate.toLocaleDateString();
      }
      
      messageContent = lastMessage.content;
    } else {
       dateStr = new Date(group.createdAt).toLocaleDateString();
    }
    
    return (
      <TouchableOpacity 
        testID={`group-item-${group.id}`}
        style={styles.itemContainer}
        onPress={() => router.push({
          pathname: '/group/[id]',
          params: { id: group.id, name: group.name }
        })}
      >
        <Image 
          source={{ uri: `https://api.dicebear.com/7.x/initials/png?seed=${group.name}&backgroundColor=006eff` }} 
          style={styles.avatar} 
        />
        <View style={[styles.textContainer, { borderBottomColor: colors.border }]}>
          <View style={styles.headerRow}>
            <Text testID={`group-name-${group.id}`} style={[styles.groupName, { color: colors.text }]} numberOfLines={1}>
              {group.name}
            </Text>
            <View style={styles.metaRow}>
              {isUnread && <View testID={`unread-indicator-${group.id}`} style={styles.unreadDot} />}
              <Text style={[styles.timeText, { color: colors.text }]}>{dateStr}</Text>
            </View>
          </View>
          <View style={styles.messageRow}>
            <Text style={[styles.lastMessage, { color: colors.text }]} numberOfLines={2}>
              {messageContent}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={groupsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.group.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#e1e1e1",
  },
  textContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Align text baselines somewhat
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupName: {
    fontSize: 17,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    opacity: 0.6,
    lineHeight: 20,
  },
});
