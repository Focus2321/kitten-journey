// Public assets resolve against Vite's base so the site also works under a sub-path (GitHub Pages).
const base = import.meta.env.BASE_URL

/** App screens exported from the Paper file at 2x. `h` is the screen height at 390 px wide. */
export const screens = {
  welcome: { src: `${base}screens/01-welcome-start-the-journey.webp`, h: 844 },
  setupMum: { src: `${base}screens/02-setup-meet-the-mum-to-be.webp`, h: 844 },
  setupDetails: { src: `${base}screens/03-setup-what-you-know-all-optional.webp`, h: 844 },
  homeDayOne: { src: `${base}screens/04-home-day-one-empty-state.webp`, h: 1372 },
  homeExpecting: { src: `${base}screens/05-home-expecting-week-7.webp`, h: 1192 },
  checkIn: { src: `${base}screens/06-check-in-sheet-juniper-s-day.webp`, h: 844 },
  journal: { src: `${base}screens/07-juniper-s-pregnancy-journal.webp`, h: 1370 },
  birthCount: { src: `${base}screens/08-birth-they-re-here-date-count.webp`, h: 844 },
  birthNamed: { src: `${base}screens/09-birth-kitten-1-of-4-named.webp`, h: 844 },
  birthTempId: { src: `${base}screens/10-birth-kitten-3-of-4-temporary-id.webp`, h: 844 },
  birthDone: { src: `${base}screens/11-birth-litter-complete-celebration.webp`, h: 844 },
  homeNewborn: { src: `${base}screens/12-home-newborn-litter-day-5.webp`, h: 1257 },
  quickAdd: { src: `${base}screens/13-quick-add-what-happened.webp`, h: 844 },
  weighIn: { src: `${base}screens/14-quick-add-weigh-in.webp`, h: 844 },
  pipProfile: { src: `${base}screens/15-pip-kitten-profile-week-6.webp`, h: 1801 },
  pipDay: { src: `${base}screens/16-pip-s-day-check-in-moment.webp`, h: 844 },
  familyStory: { src: `${base}screens/17-family-story-memory-view.webp`, h: 3234 },
  share: { src: `${base}screens/18-share-pip-s-story-choose.webp`, h: 1397 },
  sharedView: { src: `${base}screens/19-pip-s-story-as-sam-rosa-see-it.webp`, h: 1965 },
} as const

export type ScreenKey = keyof typeof screens

/** Real cat photos used in the app (600×600). */
export const photos = {
  juniper: `${base}photos/juniper.webp`,
  juniperResting: `${base}photos/juniper-resting.webp`,
  juniperWk5: `${base}photos/juniper-wk5.webp`,
  juniperWk6: `${base}photos/juniper-wk6.webp`,
  juniperWk7: `${base}photos/juniper-wk7.webp`,
  pip: `${base}photos/pip.webp`,
  pipOlder: `${base}photos/pip-older.webp`,
  fig: `${base}photos/fig.webp`,
  moth: `${base}photos/moth.webp`,
  mothPlay: `${base}photos/moth-play.webp`,
  biscuit: `${base}photos/biscuit.webp`,
  cuddle: `${base}photos/cuddle.webp`,
  nap: `${base}photos/nap.webp`,
} as const

export type PhotoKey = keyof typeof photos
