import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
};

export default function Button({ title, onPress, loading, disabled, style }: Props) {
    const isDisabled = loading || disabled;
    return (
        <Pressable
            accessibilityRole="button"
            onPress={isDisabled ? undefined : onPress}
            style={({ pressed }) => [
                styles.btn,
                pressed && { backgroundColor: colors.primaryHover },
                isDisabled && { opacity: 0.6 },
                style,
            ]}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{title}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
