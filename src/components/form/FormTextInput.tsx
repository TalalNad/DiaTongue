import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

type Props = TextInputProps & { label: string; error?: string };

export default function FormTextInput({ label, error, style, onFocus, onBlur, ...rest }: Props) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                placeholderTextColor={colors.textMuted}
                style={[
                    styles.input,
                    focused && styles.inputFocused,
                    !!error && styles.inputError,
                    style,
                ]}
                onFocus={(e) => {
                    setFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    onBlur?.(e);
                }}
                {...rest}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: 16 },
    label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 6 },
    input: {
        backgroundColor: colors.inputBg,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        fontSize: 16,
    },
    inputFocused: { borderColor: colors.primary },
    inputError: { borderColor: colors.danger },
    error: { color: colors.danger, fontSize: 12, marginTop: 6 },
});
