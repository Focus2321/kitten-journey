import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Avatar, AvatarStack, Icon, Pressable, Screen, Text } from '@/components/ui';
import { ageLabel, daysBetween, formatLong, formatTime, pregnancyWeek, toDate } from '@/data/dates';
import { photoSource, type Photo } from '@/data/photos';
import { displayName, useStore, type Checkin, type Kitten, type Moment } from '@/data/store';
import { colors, gutter, radius } from '@/theme/tokens';

const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const word = (n: number) => WORDS[n] ?? String(n);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const month = (iso: string) => MONTHS[toDate(iso).getMonth()];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Screen 17 — the family's memory view. Chapters appear as the journey does. */
export function StoryTab() {
  const { width } = useWindowDimensions();
  const phase = useStore((s) => s.phase);
  const mother = useStore((s) => s.mother);
  const kittens = useStore((s) => s.kittens);
  const moments = useStore((s) => s.moments);
  const checkins = useStore((s) => s.checkins);
  const today = useStore((s) => s.today);
  const birthDate = useStore((s) => s.birth?.date ?? null);

  const motherName = mother?.name ?? 'Mum';
  const pregnancy = checkins.filter((c) => c.subjectId === 'mother').sort((a, b) => a.date.localeCompare(b.date));
  const born = birthDate !== null && kittens.length > 0;
  const namings = moments.filter((m) => m.first && /name/i.test(m.first)).sort((a, b) => a.date.localeCompare(b.date));
  const timeline = moments.filter((m) => !(m.first && /name/i.test(m.first))).sort((a, b) => a.date.localeCompare(b.date));

  const photoCount = pregnancy.filter((c) => c.photo).length + moments.filter((m) => m.photo).length + kittens.filter((k) => k.photo).length + (mother?.photo ? 1 : 0);
  const startISO = pregnancy[0]?.date ?? mother?.matingDate ?? today;
  const kittenNames = kittens.map(displayName);
  const namesLine = kittenNames.length > 1 ? `${kittenNames.slice(0, -1).join(', ')} & ${kittenNames[kittenNames.length - 1]}` : kittenNames[0];

  let chapter = 0;
  const next = () => ++chapter;

  return (
    <Screen bottomInset={TAB_BAR_SPACE} padded={false}>
      <View style={{ paddingHorizontal: gutter, paddingTop: 8, alignItems: 'center' }}>
        <Text variant="label">Our story</Text>
      </View>

      <View style={{ paddingHorizontal: gutter, paddingTop: 20, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text variant="headline" style={{ fontSize: 44, lineHeight: 44 }}>
            {born ? `${motherName} and the ${word(kittens.length)}` : `${motherName}, waiting`}
          </Text>
          <Text variant="body" color={colors.muted}>
            {`${month(startISO)} to now, in ${photoCount} photo${photoCount === 1 ? '' : 's'} and a lot of purring`}
          </Text>
        </View>
        <View style={{ height: 300, borderRadius: radius.xxl, overflow: 'hidden', backgroundColor: colors.surface }}>
          {mother?.photo ? (
            <Image source={photoSource(mother.photo)} contentFit="cover" style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="cat" size={56} color={colors.dashed} strokeWidth={1.5} />
            </View>
          )}
          {born && (
            <View style={{ position: 'absolute', left: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 5, paddingLeft: 5, paddingRight: 16 }}>
              <AvatarStack items={kittens.map((k) => k.photo)} size={36} overlap={12} />
              <Text variant="smallStrong">{namesLine}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 1 · Waiting */}
      {(pregnancy.length > 0 || phase === 'expecting') && (
        <Chapter n={next()} label={born ? `Waiting · ${month(startISO)} – ${month(birthDate)}` : `Waiting · since ${month(startISO)}`} title="The waiting weeks">
          {pregnancy.some((c) => c.photo) && (
            <View style={{ flexDirection: 'row', gap: 6, height: 150 }}>
              {pregnancy
                .filter((c) => c.photo)
                .slice(-3)
                .map((c) => (
                  <View key={c.id} style={{ flex: 1, borderRadius: radius.md, overflow: 'hidden' }}>
                    <Image source={photoSource(c.photo as Photo)} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                    <View style={{ position: 'absolute', left: 8, bottom: 8, backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 8 }}>
                      <Text variant="caption" weight={700} color={colors.ink} style={{ fontSize: 11, lineHeight: 14 }}>
                        {mother?.matingDate ? `Wk ${pregnancyWeek(mother.matingDate, c.date)}` : formatLong(c.date).slice(0, 6)}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
          {quoteFor(pregnancy) && (
            <View style={{ flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: 22, padding: 16 }}>
              <View style={{ width: 3, borderRadius: 2, backgroundColor: colors.sun }} />
              <Text variant="body" weight={500} style={{ flex: 1, lineHeight: 23 }}>
                “{quoteFor(pregnancy)}”
              </Text>
            </View>
          )}
          {pregnancy.length === 0 && (
            <Text variant="small" color={colors.muted}>
              Check in on {motherName} and her weeks will land here.
            </Text>
          )}
        </Chapter>
      )}

      {/* 2 · Birth */}
      {born && (
        <Chapter n={next()} label={formatLong(birthDate)} title={birthTitle(kittens)}>
          <View style={{ borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line, paddingVertical: 6, paddingHorizontal: 16 }}>
            {kittens.map((k, i) => {
              const renamed = namings.some((m) => m.subjectId === k.id);
              return (
                <View key={k.id} style={{ height: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < kittens.length - 1 ? 1 : 0, borderBottomColor: colors.line }}>
                  <Text variant="caption" weight={600} style={{ width: 44, fontSize: 13 }}>
                    {k.birthTime ? formatTime(k.birthTime) : '—'}
                  </Text>
                  <Avatar photo={k.photo} size={40} dot={k.name ? undefined : k.tempColor} />
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text variant="smallStrong" style={{ fontSize: 15, lineHeight: 19 }}>
                      {renamed || !k.name ? `${k.tempId} collar` : k.name}
                    </Text>
                    <Text variant="small" color={colors.muted} style={{ fontSize: 13, lineHeight: 17 }}>
                      {[k.birthWeight ? `${k.birthWeight} g` : null, k.name && !renamed ? k.tagline : 'no name yet'].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Chapter>
      )}

      {/* 3 · Naming days */}
      {born &&
        namings.map((m) => {
          const k = kittens.find((x) => x.id === m.subjectId);
          if (!k) return null;
          return (
            <Chapter key={m.id} n={next()} label={`${ageLabel(birthDate, m.date)} · ${formatLong(m.date)}`}>
              <View style={{ backgroundColor: colors.pawSoft, borderRadius: radius.xxl, overflow: 'hidden' }}>
                <View style={{ height: 250, backgroundColor: colors.line }}>
                  {(m.photo ?? k.photo) && <Image source={photoSource((m.photo ?? k.photo) as Photo)} contentFit="cover" style={{ width: '100%', height: '100%' }} />}
                </View>
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22, gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 6, paddingLeft: 8, paddingRight: 12 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: k.tempColor }} />
                      <Text variant="small" weight={600} color={colors.muted} style={{ textDecorationLine: 'line-through' }}>
                        {k.tempId} collar
                      </Text>
                    </View>
                    <Icon name="arrow-right" size={22} />
                  </View>
                  <Text variant="display">{displayName(k)}</Text>
                  <Text variant="body" style={{ lineHeight: 23 }}>
                    {m.text}
                  </Text>
                </View>
              </View>
            </Chapter>
          );
        })}

      {/* 4 · Firsts and moments */}
      {born && timeline.length > 0 && (
        <Chapter n={next()} label={weeksLabel(birthDate, today)} title={timeline.some((m) => m.first) ? 'Firsts, one by one' : 'Small days, big changes'}>
          <View style={{ paddingLeft: 4 }}>
            {timeline.map((m, i) => (
              <TimelineRow key={m.id} moment={m} kittens={kittens} motherName={motherName} birthDate={birthDate} index={i} last={i === timeline.length - 1} />
            ))}
          </View>
        </Chapter>
      )}

      {/* 5 · Today */}
      {born && (
        <Chapter n={next()} label={`${ageLabel(birthDate, today)} · today`} title={kittens.length > 1 ? `${cap(word(kittens.length))} very different cats` : 'One small cat'}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {kittens.map((k) => (
              <Pressable key={k.id} onPress={() => router.push(`/kitten/${k.id}`)} pressScale={0.98} accessibilityRole="button" accessibilityLabel={displayName(k)} style={{ width: (width - gutter * 2 - 10) / 2, gap: 8 }}>
                <View style={{ height: 190, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface }}>
                  {k.photo ? (
                    <Image source={photoSource(k.photo)} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="paw" size={28} color={colors.dashed} />
                    </View>
                  )}
                </View>
                <View style={{ paddingHorizontal: 4, gap: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text variant="bodyStrong" weight={700} style={{ lineHeight: 20 }}>
                      {displayName(k)}
                    </Text>
                    {!k.name && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: k.tempColor }} />}
                  </View>
                  <Text variant="small" color={colors.muted} style={{ fontSize: 13, lineHeight: 17 }} numberOfLines={1}>
                    {k.tagline ?? k.coat}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Chapter>
      )}

      {/* Footer */}
      <View style={{ alignItems: 'center', gap: 14, paddingHorizontal: gutter, paddingTop: 44, paddingBottom: 24 }}>
        <View style={{ width: 2, height: 36, backgroundColor: colors.line }} />
        <Text variant="section" align="center">
          Still being written
        </Text>
        <Text variant="small" color={colors.muted} align="center" style={{ fontSize: 15, lineHeight: 21 }}>
          Every moment you add lands here, in order.
        </Text>
        <Pressable
          onPress={() => router.push(born ? '/sheet/quick-add' : '/sheet/mother-checkin')}
          accessibilityRole="button"
          accessibilityLabel={born ? 'Add a moment' : `Check in on ${motherName}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingLeft: 8, paddingRight: 22, borderRadius: radius.pill, backgroundColor: colors.ink }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.sun, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={16} strokeWidth={2.4} />
          </View>
          <Text variant="bodyStrong" weight={700} color={colors.ground}>
            {born ? 'Add a moment' : `Check in on ${motherName}`}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

// ---------------------------------------------------------------------------

function Chapter({ n, label, title, children }: { n: number; label: string; title?: string; children: ReactNode }) {
  return (
    <View style={{ paddingHorizontal: gutter, paddingTop: n === 1 ? 36 : 40, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.sun, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="caption" weight={800} color={colors.ink} style={{ fontSize: 13 }}>
            {n}
          </Text>
        </View>
        <Text variant="label">{label}</Text>
      </View>
      {title && <Text variant="title">{title}</Text>}
      {children}
    </View>
  );
}

const DOTS = [
  { fill: colors.sun, ring: colors.sunSoft },
  { fill: colors.paw, ring: colors.pawSoft },
  { fill: colors.ink, ring: colors.line },
] as const;

function TimelineRow({ moment, kittens, motherName, birthDate, index, last }: { moment: Moment; kittens: Kitten[]; motherName: string; birthDate: string; index: number; last: boolean }) {
  const dot = DOTS[index % DOTS.length];
  const k = kittens.find((x) => x.id === moment.subjectId);
  const who = moment.subjectId === 'litter' ? (kittens.length === 1 ? displayName(kittens[0]) : `All ${word(kittens.length)}`) : k ? displayName(k) : moment.subjectId === 'mother' ? motherName : null;
  const title = moment.first ? `${moment.first}${who ? ` · ${who}` : ''}` : (who ?? 'A moment');
  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ width: 20, alignItems: 'center' }}>
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: dot.fill, borderWidth: 3, borderColor: dot.ring }} />
        {!last && <View style={{ flex: 1, width: 2, backgroundColor: colors.line }} />}
      </View>
      <View style={{ flex: 1, gap: 10, paddingBottom: last ? 0 : 20 }}>
        <View style={{ gap: 2 }}>
          <Text variant="caption" weight={600}>
            {ageLabel(birthDate, moment.date)}
          </Text>
          <Text variant="bodyStrong" weight={700} style={{ lineHeight: 21 }}>
            {title}
          </Text>
          <Text variant="small" color={colors.muted} style={{ lineHeight: 19 }}>
            {moment.text}
          </Text>
        </View>
        {moment.photo && (
          <View style={{ height: 96, flexDirection: 'row', gap: 6 }}>
            <Image source={photoSource(moment.photo)} contentFit="cover" style={{ flex: 1, borderRadius: 16 }} />
          </View>
        )}
      </View>
    </View>
  );
}

function quoteFor(checkins: Checkin[]) {
  const withNote = checkins.filter((c) => c.note);
  return withNote[withNote.length - 1]?.note ?? null;
}

function birthTitle(kittens: Kitten[]) {
  const n = cap(word(kittens.length));
  const times = kittens.map((k) => k.birthTime).filter((t): t is string => !!t);
  if (times.length && times.every((t) => t < '09:00')) return `${n}, before breakfast`;
  if (times.length && times.every((t) => t >= '20:00' || t < '05:00')) return `${n}, in the night`;
  return `${n}, one by one`;
}

function weeksLabel(birthDate: string, today: string) {
  const days = daysBetween(birthDate, today);
  return days < 14 ? `Days 1 – ${Math.max(1, days)}` : `Weeks 1 – ${Math.floor(days / 7)}`;
}
