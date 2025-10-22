import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
} from 'react-native';
import { colors } from '../../theme/colors';
import FormTextInput from '../../components/form/FormTextInput';
import Button from '../../components/ui/Button';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; root?: string }>({});

    const validate = () => {
        const next: typeof errors = {};
        if (!email) next.email = 'Email is required';
        else if (!emailRegex.test(email)) next.email = 'Enter a valid email';
        if (!password) next.password = 'Password is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmit = async () => {
        if (!validate()) return;
        try {
            setLoading(true);
            // TODO: replace with your real sign-in call
            await new Promise((r) => setTimeout(r, 800));
            console.log('Signed in');
            // e.g. navigation.replace('Home')
        } catch {
            setErrors({ root: 'Invalid credentials' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoGlyph}>〰︎</Text>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue to DiaTongue</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Sign In</Text>
                        <Text style={styles.cardSub}>Enter your credentials to access your account</Text>

                        <FormTextInput
                            label="Email"
                            placeholder="your@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="username"
                            value={email}
                            onChangeText={setEmail}
                            error={errors.email}
                        />

                        <FormTextInput
                            label="Password"
                            placeholder="••••••••"
                            autoCapitalize="none"
                            secureTextEntry={!showPw}
                            textContentType="password"
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                        />

                        <Pressable onPress={() => setShowPw((s) => !s)} style={styles.showPw}>
                            <Text style={styles.showPwText}>{showPw ? 'Hide' : 'Show'} password</Text>
                        </Pressable>

                        {!!errors.root && <Text style={styles.rootError}>{errors.root}</Text>}

                        <Button title="Sign In" onPress={onSubmit} loading={loading} style={{ marginTop: 6 }} />
                    </View>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        Don’t have an account?
                        <Text onPress={() => console.log('Sign up')} style={styles.link}> Sign up</Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 20, paddingBottom: 32 },
    header: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
    logoCircle: {
        height: 64, width: 64, borderRadius: 32, backgroundColor: '#E7F0FF',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    logoGlyph: { color: colors.primary, fontSize: 28, fontWeight: '700' },
    title: { fontSize: 28, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6 },

    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    cardTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
    cardSub: { fontSize: 14, color: colors.textMuted, marginBottom: 12 },

    showPw: { alignSelf: 'flex-end', marginBottom: 10 },
    showPwText: { color: colors.textMuted, fontSize: 13 },

    rootError: { color: colors.danger, marginBottom: 8 },

    footer: { textAlign: 'center', color: colors.textMuted, marginTop: 18, fontSize: 13 },
    link: { color: colors.primary, fontWeight: '600' },
});
