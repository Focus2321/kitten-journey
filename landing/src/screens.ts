/** App screens exported from the Paper file at 2x. `h` is the screen height at 390 px wide. */
export const screens = {
  welcome: { src: '/screens/01-welcome-start-the-journey.webp', h: 844 },
  setupMum: { src: '/screens/02-setup-meet-the-mum-to-be.webp', h: 844 },
  setupDetails: { src: '/screens/03-setup-what-you-know-all-optional.webp', h: 844 },
  homeDayOne: { src: '/screens/04-home-day-one-empty-state.webp', h: 1372 },
  homeExpecting: { src: '/screens/05-home-expecting-week-7.webp', h: 1192 },
  checkIn: { src: '/screens/06-check-in-sheet-juniper-s-day.webp', h: 844 },
  journal: { src: '/screens/07-juniper-s-pregnancy-journal.webp', h: 1370 },
  birthCount: { src: '/screens/08-birth-they-re-here-date-count.webp', h: 844 },
  birthNamed: { src: '/screens/09-birth-kitten-1-of-4-named.webp', h: 844 },
  birthTempId: { src: '/screens/10-birth-kitten-3-of-4-temporary-id.webp', h: 844 },
  birthDone: { src: '/screens/11-birth-litter-complete-celebration.webp', h: 844 },
  homeNewborn: { src: '/screens/12-home-newborn-litter-day-5.webp', h: 1257 },
  quickAdd: { src: '/screens/13-quick-add-what-happened.webp', h: 844 },
  weighIn: { src: '/screens/14-quick-add-weigh-in.webp', h: 844 },
  pipProfile: { src: '/screens/15-pip-kitten-profile-week-6.webp', h: 1801 },
  pipDay: { src: '/screens/16-pip-s-day-check-in-moment.webp', h: 844 },
  familyStory: { src: '/screens/17-family-story-memory-view.webp', h: 3234 },
  share: { src: '/screens/18-share-pip-s-story-choose.webp', h: 1397 },
  sharedView: { src: '/screens/19-pip-s-story-as-sam-rosa-see-it.webp', h: 1965 },
} as const

export type ScreenKey = keyof typeof screens

/** Real cat photos used in the app (600×600). */
export const photos = {
  juniper: '/photos/juniper.webp',
  juniperResting: '/photos/juniper-resting.webp',
  juniperWk5: '/photos/juniper-wk5.webp',
  juniperWk6: '/photos/juniper-wk6.webp',
  juniperWk7: '/photos/juniper-wk7.webp',
  pip: '/photos/pip.webp',
  pipOlder: '/photos/pip-older.webp',
  fig: '/photos/fig.webp',
  moth: '/photos/moth.webp',
  mothPlay: '/photos/moth-play.webp',
  biscuit: '/photos/biscuit.webp',
  cuddle: '/photos/cuddle.webp',
  nap: '/photos/nap.webp',
} as const

export type PhotoKey = keyof typeof photos
