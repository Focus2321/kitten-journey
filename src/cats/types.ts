export type CatColor = 'ginger' | 'tabby' | 'grey' | 'black' | 'cream' | 'calico'

/** Shared props for every illustration. Size them with className (e.g. "w-40"); the SVG keeps its own aspect ratio. */
export type CatProps = { className?: string; color?: CatColor }
