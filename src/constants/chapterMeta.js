export const VOLUMES = [
  {
    id: "volume-1",
    label: "Volume 1",
    chapters: [
      {
        id: "chapter-1",
        label: "Chapter I:",
        title: "THE SET OF NATURAL NUMBERS",
      },
      {
        id: "chapter-2",
        label: "Chapter II:",
        title: "DIVISIBILITY RELATIONS AND PROPERTIES",
      },
      {
        id: "chapter-3",
        label: "Chapter III:",
        title: "THE SET OF INTEGERS",
      },
      {
        id: "chapter-4",
        label: "Chapter IV:",
        title: "SOME PLANE SHAPES IN REAL LIFE",
      },
      {
        id: "chapter-5",
        label: "Chapter V:",
        title: "SYMMETRY OF PLANE SHAPES IN NATURE",
      },
    ],
  },
  {
    id: "volume-2",
    label: "Volume 2",
    chapters: [],
  },
];

export const DEFAULT_VOLUME = "volume-1";
export const CHAPTERS = VOLUMES.flatMap((volume) => volume.chapters);

export function getVolumeById(volumeId) {
  return VOLUMES.find((volume) => volume.id === volumeId) ?? VOLUMES[0];
}

export function getChaptersByVolume(volumeId) {
  return getVolumeById(volumeId).chapters;
}

export function getChapterById(chapterId) {
  return CHAPTERS.find((chapter) => chapter.id === chapterId) ?? CHAPTERS[0];
}
