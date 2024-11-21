export interface MapDataV3 {
  colorNotes: ColorNote[];
  sliders: Slider[];
  obstacles: Obstacles[];
  version: string;
}

export interface MapInfoDataV2 {
  _version: string;
  _songName: string;
  _songSubName: string;
  _songAuthorName: string;
  _levelAuthorName: string;
  _beatsPerMinute: number;
  _shuffle: number;
  _shufflePeriod: number;
  _previewStartTime: number;
  _previewDuration: number;
  _songFilename: string;
  _coverImageFilename: string;
  _songTimeOffset: number;
  _difficultyBeatmapSets: BeatMapSet[];
}

export interface BeatMapSet {
  _beatmapCharacteristicName: string;
  _difficultyBeatmaps: DifficultyBeatMap[];
}

export interface DifficultyBeatMap {
  _difficulty: string;
  _difficultyRank: number;
  _beatmapFilename: string;
  _customData: {
    _difficultyLabel: string;
  };
}

export interface MapDataV2 {
  _notes: NoteV2[];
  _obstacles: ObstaclesV2[];
  _version: string;
}

export interface NoteV2 {
  _cutDirection: number; // directions of the cuts
  _lineIndex: number; // horizontal index, leftmost, left, right, rightmost 0-3
  _lineLayer: number; // vertical height from -1 to 1
  _type: number; // 0 is left hand 1 right hand
  _time: number;
}

interface ObstaclesV2 {
  _duration: number; // Duration for how long the obstacle is present
  _lineIndex: number; // The lane (index) where the obstacle appears
  _time: number; // The time (in seconds or beats) when the obstacle starts
  _type: number; // The type of obstacle (e.g., normal obstacle, wall, etc.)
  _width: number; // The width of the obstacle (how many lanes it covers)
}

interface Obstacles {
  b: number; // Time (beat) when the obstacle appears
  d: number; // Duration (how long the obstacle stays on screen)
  h: number; // Height (vertical size of the obstacle)
  w: number; // Width (horizontal size of the obstacle)
  x: number; // Horizontal position (lane index or relative position)
  y: number; // Vertical position (depth in 3D space)
}

interface Slider {
  b: number; // Time (beat) when the slider starts
  c: number; // Cut direction at the start (or general movement direction)
  d: number; // Duration or end of the slider (how long it lasts)
  m: number; // Movement mode (defines the type of movement)
  mu: number; // Movement units (can define a scaling factor for the movement)
  tb: number; // Start position or timing for the slider
  tc: number; // End position (timing or location)
  tmu: number; // Timing adjustment for movement
  tx: number; // Starting x (horizontal) position
  ty: number; // Starting y (vertical) position
  x: number; // Ending x (horizontal) position
  y: number; // Ending y (vertical) position
}

export interface ColorNote {
  b: number; // Time (beats) for the note
  x: number; // Horizontal position (Lane index)
  y: number; // Vertical position (Layer or depth in 3D space)
  a: number; // Note type (e.g., normal, bomb, etc.)
  c: number; // Cut direction (0-7, etc.)
  d: number; // Additional note-specific data (may vary based on context)
}
