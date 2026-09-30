import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Share, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button, Icon, IconButton, IconButtonSpacer, Screen, Text, TopBar } from '@/components/ui';
import { formatShort } from '@/data/dates';
import { photoSource } from '@/data/photos';
import { colors, radius } from '@/theme/tokens';

import { HomeIcon, TrendIcon } from './HandoffIcons';
import { NotFound } from './NotFound';
import { DEFAULT_INCLUDE, encodeInclude, shareMessage, useStory, type Include, type IncludeKey } from './story';
import { Toggle } from './Toggle';

const layout = LinearTransition.duration(260);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Screen 18 — the owner picks what travels with the kitten, then creates a link. */
export function ShareStoryScreen({ id }: { id?: string }) {
  const story = useStory(id);
  const [include, setInclude] = useState<Include>(DEFAULT_INCLUDE);

  if (!story) return <NotFound />;
  const { name, pro, home, firsts, moments, firstWeight, latestWeight, photoKeys, mother, siblings, loves } = story;
  const set = (k: IncludeKey) => (v: boolean) => setInclude((i) => ({ ...i, [k]: v }));

  const onShare = async () => {
    // No public story links yet — share the note on its own rather than a link that goes nowhere.
    const message = shareMessage(story);
    try {
      await Share.share({ message }, { subject: `${name}’s story` });
    } catch {
      // The user dismissed the sheet — nothing to do.
    }
  };
  const onPreview = () => router.push({ pathname: '/shared/[id]', params: { id: story.kitten.id, include: encodeInclude(include) } });

  const grewLine = firstWeight && latestWeight && firstWeight.id !== latestWeight.id ? `${firstWeight.grams} g at birth → ${latestWeight.grams} g` : firstWeight ? `${firstWeight.grams} g at birth` : 'No weigh-ins yet';
  const care = [
    ['Family vet', mother?.vet ?? ''],
    ['Loves', loves],
  ].filter(([, v]) => v) as [string, string][];
  const familyLine = mother || siblings.length ? 'Names and one photo each' : 'Nothing to add yet';
  const privacy = include.family
    ? `Only ${name}’s story, plus ${mother ? `${mother.name} and ` : ''}${pro.poss} siblings by name. Your address stays private.`
    : `Only ${name}’s story. Your address and the other kittens stay private.`;

  return (
    <Screen header={<TopBar left={<IconButton icon="close" label="Close" onPress={() => router.back()} />} center={<Text variant="label">New home</Text>} right={<IconButtonSpacer />} />}>
      {/* Title + polaroid */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, paddingTop: 8 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Text variant="headline">
            Send {name} off with {pro.poss} story
          </Text>
          <Text variant="body" color={colors.muted} style={{ fontSize: 15, lineHeight: 21 }}>
            Pick what travels with {pro.obj}.
          </Text>
        </View>
        <View style={{ width: 92, height: 116 }}>
          <View style={{ position: 'absolute', left: 14, top: 4, width: 76, height: 96, borderRadius: 18, backgroundColor: colors.pawSoft, transform: [{ rotate: '8deg' }] }} />
          {story.kitten.photo ? (
            <Image source={photoSource(story.kitten.photo)} contentFit="cover" style={{ position: 'absolute', left: 0, top: 10, width: 78, height: 100, borderRadius: 18, borderWidth: 3, borderColor: colors.ground, transform: [{ rotate: '-5deg' }] }} />
          ) : (
            <View style={{ position: 'absolute', left: 0, top: 10, width: 78, height: 100, borderRadius: 18, borderWidth: 3, borderColor: colors.ground, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] }}>
              <Icon name="cat" size={28} color={colors.muted} />
            </View>
          )}
        </View>
      </View>

      {/* Going to */}
      <Section label="Going to">
        <View style={{ height: 60, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <HomeIcon />
          <Text variant="body" weight={600} style={{ flex: 1, fontSize: 17 }}>
            {home?.names ?? 'Their new family'}
          </Text>
          <Text variant="caption" color={colors.muted} style={{ fontSize: 13, lineHeight: 16 }}>
            {home ? `Moving day ${formatShort(home.movingDay)}` : 'Moving day not set yet'}
          </Text>
        </View>
      </Section>

      {/* What travels */}
      <Section label={`What travels with ${pro.obj}`}>
        <Animated.View layout={layout} style={{ borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.lg, padding: 14, gap: 14 }}>
          <Row tile={colors.pawSoft} icon={<Icon name="image" />} title="Favourite photos" subtitle={photoKeys.length ? `${plural(photoKeys.length, 'photo')} from ${pro.poss} story` : 'None yet — add some anytime'} value={include.photos} onChange={set('photos')} />
          {include.photos && photoKeys.length > 0 && (
            <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)} style={{ flexDirection: 'row', gap: 6 }}>
              {photoKeys.slice(0, 3).map((p) => (
                <Image key={p} source={photoSource(p)} contentFit="cover" style={{ flex: 1, height: 64, borderRadius: 14 }} />
              ))}
              {photoKeys.length > 3 && (
                <View style={{ flex: 1, height: 64, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="smallStrong">+{photoKeys.length - 3}</Text>
                </View>
              )}
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View layout={layout} style={{ borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.lg, paddingHorizontal: 14 }}>
          <Row tall divider tile={colors.sunSoft} icon={<Icon name="sparkle" />} title="Firsts & moments" subtitle={`${plural(firsts.length, 'first')} · ${plural(moments.length, 'moment')}`} value={include.firsts} onChange={set('firsts')} />
          <Row tall divider tile={colors.surface} icon={<TrendIcon />} title={`How ${pro.subj} grew`} subtitle={grewLine} value={include.growth} onChange={set('growth')} />
          <Row tall tile={colors.surface} icon={<Icon name="people" size={22} />} title={`${pro.Poss} mum & siblings`} subtitle={familyLine} value={include.family} onChange={set('family')} />
        </Animated.View>
      </Section>

      {/* Care essentials */}
      <Section label="Care essentials">
        {care.length > 0 ? (
          <View style={{ backgroundColor: colors.sunSoft, borderRadius: radius.lg, padding: 16, gap: 12 }}>
            {care.map(([k, v], i) => (
              <View key={k} style={{ gap: 12 }}>
                {i > 0 && <Divider />}
                <CareRow k={k} v={v} />
              </View>
            ))}
          </View>
        ) : (
          <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.dashed, borderRadius: radius.lg, padding: 16 }}>
            <Text variant="small" weight={500} color={colors.muted} style={{ lineHeight: 19 }}>
              No care notes yet. Food, vet visits and favourite things only appear here once you’ve written them down.
            </Text>
          </View>
        )}
      </Section>

      {/* Privacy + CTAs */}
      <Animated.View layout={layout} style={{ paddingTop: 28, paddingBottom: 16, gap: 12 }}>
        <Animated.View layout={layout} style={{ backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="lock" size={18} />
          <Animated.View key={privacy} entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ flex: 1 }}>
            <Text variant="small" weight={500} style={{ fontSize: 13, lineHeight: 17 }}>
              {privacy}
            </Text>
          </Animated.View>
        </Animated.View>
        <Button label={`Share a note about ${name}`} iconLeft="share" onPress={onShare} haptics="medium" />
        <Button label="Preview their story page" variant="ghost" size="md" onPress={onPreview} haptics="none" />
        <Text variant="caption" weight={500} color={colors.muted} style={{ textAlign: 'center', lineHeight: 16 }}>
          Story links aren’t live yet, so the full page stays on this phone for now.
        </Text>
      </Animated.View>
    </Screen>
  );
}

function Section({ label, trailing, children }: { label: string; trailing?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ paddingTop: 28, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="label">{label}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

type RowProps = { tile: string; icon: ReactNode; title: string; subtitle: string; value: boolean; onChange: (v: boolean) => void; tall?: boolean; divider?: boolean };

function Row({ tile, icon, title, subtitle, value, onChange, tall, divider }: RowProps) {
  return (
    <View style={{ height: tall ? 74 : undefined, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: divider ? 1 : 0, borderBottomColor: colors.line }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: tile, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="bodyStrong" weight={700} style={{ lineHeight: 20 }}>
          {title}
        </Text>
        <Text variant="small" color={colors.muted} style={{ fontSize: 13, lineHeight: 17 }}>
          {subtitle}
        </Text>
      </View>
      <Toggle value={value} onChange={onChange} label={title} />
    </View>
  );
}

function CareRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <Text variant="small" weight={600} color={colors.muted} style={{ width: 84, fontSize: 13 }}>
        {k}
      </Text>
      <Text variant="small" weight={600} style={{ flex: 1 }}>
        {v}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.sunDivider }} />;
}
