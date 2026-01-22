
import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { GameFilter } from "@/objects/Game";
import { useServer } from "@/contexts/ServerContext";


interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: GameFilter) => void;
    currentFilters: GameFilter | null;
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply, currentFilters }) => {
    const { colors } = useTheme();
    const server = useServer();

    const [sport, setSport] = useState<string[]>(currentFilters?.sport || []);
    const [skillLevel, setSkillLevel] = useState<string[]>(currentFilters?.skillLevel || []);
    const [location, setLocation] = useState<string | undefined>(currentFilters?.location);
    const [maxPlayers, setMaxPlayers] = useState<string | undefined>(currentFilters?.maxPlayers?.toString());

    const [sports, setSports] = useState<string[]>([]);
    const [skillLevels, setSkillLevels] = useState<string[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            const fetchedSports = await server.getPossibleSports();
            const fetchedSkillLevels = await server.getPossibleSkillLevels();
            setSports(fetchedSports);
            setSkillLevels(fetchedSkillLevels);
        };
        fetchOptions();
    }, [server]);

    useEffect(() => {
        if (visible) {
            setSport(currentFilters?.sport || []);
            setSkillLevel(currentFilters?.skillLevel || []);
            setLocation(currentFilters?.location);
            setMaxPlayers(currentFilters?.maxPlayers?.toString());
        }
    }, [visible, currentFilters]);

    const handleApply = () => {
        const filters: GameFilter = {
            sport,
            skillLevel,
            location,
            maxPlayers: maxPlayers ? parseInt(maxPlayers) : undefined
        };
        // Clean up undefined values
        if (filters.sport && filters.sport.length === 0) delete filters.sport;
        if (filters.skillLevel && filters.skillLevel.length === 0) delete filters.skillLevel;
        Object.keys(filters).forEach(key => (filters as any)[key] === undefined && delete (filters as any)[key]);

        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        setSport([]);
        setSkillLevel([]);
        setLocation(undefined);
        setMaxPlayers(undefined);
        onApply({} as GameFilter); // modify this based on how clear should be handled
        onClose();
    };

    const toggleSport = (s: string) => {
        if (sport.includes(s)) {
            setSport(sport.filter(item => item !== s));
        } else {
            setSport([...sport, s]);
        }
    };

    const toggleSkillLevel = (sl: string) => {
        if (skillLevel.includes(sl)) {
            setSkillLevel(skillLevel.filter(item => item !== sl));
        } else {
            setSkillLevel([...skillLevel, sl]);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Games</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sport</Text>
                        <View style={styles.pillsContainer}>
                            {sports.map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[
                                        styles.pill,
                                        sport.includes(s) && styles.activePill,
                                        { borderColor: colors.border }
                                    ]}
                                    onPress={() => toggleSport(s)}
                                >
                                    <Text style={[
                                        styles.pillText,
                                        sport.includes(s) && styles.activePillText,
                                        { color: colors.text }
                                    ]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Skill Level</Text>
                        <View style={styles.pillsContainer}>
                            {skillLevels.map((sl) => (
                                <TouchableOpacity
                                    key={sl}
                                    style={[
                                        styles.pill,
                                        skillLevel.includes(sl) && styles.activePill,
                                        { borderColor: colors.border }
                                    ]}
                                    onPress={() => toggleSkillLevel(sl)}
                                >
                                    <Text style={[
                                        styles.pillText,
                                        skillLevel.includes(sl) && styles.activePillText,
                                        { color: colors.text }
                                    ]}>{sl}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Enter location address"
                            placeholderTextColor={colors.text + '80'}
                            value={location}
                            onChangeText={setLocation}
                        />

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Max Players</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="e.g. 10"
                            placeholderTextColor={colors.text + '80'}
                            value={maxPlayers}
                            onChangeText={setMaxPlayers}
                            keyboardType="numeric"
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={handleApply}>
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        width: "100%",
        height: "80%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    scrollView: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 15,
        marginBottom: 10,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    activePill: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    pillText: {
        fontSize: 14,
    },
    activePillText: {
        color: 'white',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingBottom: 20,
        gap: 15,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#f0f0f0', // Adjust for dark mode if needed
    },
    applyButton: {
        backgroundColor: '#007AFF',
    },
    clearButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default FilterModal;
