import type { StartSessionInput } from '../types/dashboard';

export type WaterCycleStageId =
  | 'evaporation'
  | 'condensation'
  | 'precipitation'
  | 'collection';

export type WeatherConditionId = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy';

export type WeatherElementId =
  | 'temperature'
  | 'humidity'
  | 'wind'
  | 'precipitation'
  | 'cloud-cover';

export type PrecipitationForm = 'rain' | 'snow' | 'hail';

export type WaterCycleChapterId =
  | 'intro'
  | 'stages'
  | 'weather'
  | 'connection'
  | 'real-world'
  | 'knowledge-check';

export interface WaterCycleChapter {
  id: WaterCycleChapterId;
  number: number;
  shortTitle: string;
  title: string;
  hookQuestion: string;
  summary: string;
  mayaIntroScript: string;
}

export interface WaterCycleStageInfo {
  id: WaterCycleStageId;
  letter: 'A' | 'B' | 'C' | 'D';
  name: string;
  shortLabel: string;
  headline: string;
  explanation: string;
  keyTerm: string;
  keyTermDef: string;
  microTitle: string;
  microExplanation: string;
  colorClass: string;
}

export interface WeatherElementInfo {
  id: WeatherElementId;
  name: string;
  meaning: string;
  unitHint: string;
}

export interface WeatherConditionPreset {
  id: WeatherConditionId;
  label: string;
  temperatureC: number;
  humidityPct: number;
  windKmh: number;
  cloudCoverPct: number;
  precipitationLabel: string;
  description: string;
  primaryElements: WeatherElementId[];
}

export interface RealWorldScenario {
  id: string;
  title: string;
  visualType: 'puddle' | 'cold-glass' | 'dark-clouds';
  story: string;
  correctProcess: 'evaporation' | 'condensation' | 'precipitation';
  explanation: string;
}

export interface WeatherDetectiveCase {
  id: string;
  clueTitle: string;
  scene: WeatherConditionId;
  clues: string[];
  correctCondition: WeatherConditionId;
  correctElement: WeatherElementId;
  explanation: string;
}

export interface PredictNextCase {
  id: string;
  pausedAtStage: WaterCycleStageId;
  sceneDescription: string;
  question: string;
  correctNextStage: WaterCycleStageId;
  explanation: string;
}

export interface WaterCycleQuizQuestion {
  id: string;
  conceptTag: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ConnectedWeatherSimulation {
  condition: WeatherConditionId;
  label: string;
  temperatureC: number;
  humidityPct: number;
  windKmh: number;
  cloudCoverPct: number;
  evaporationRate: 'Low' | 'Moderate' | 'High';
  precipitationForm: 'None' | 'Light Rain' | 'Heavy Rain & Storm';
  explanation: string;
}

export const WATER_CYCLE_CHAPTERS: WaterCycleChapter[] = [
  {
    id: 'intro',
    number: 1,
    shortTitle: 'Ch 1 · Rain Mystery',
    title: 'Chapter 1: Introduction — Where Does Rain Come From?',
    hookQuestion: 'Have you ever wondered where rain comes from and where all the rainwater goes?',
    summary:
      'Watch Earth’s ocean, mountains, rivers, trees, and bright Sun working together. Water never disappears — it keeps moving continuously between Earth’s surface and the atmosphere!',
    mayaIntroScript:
      'Welcome to Class 6 Science! Have you ever wondered where rain comes from and where all the rainwater goes? Watch our live animated valley — the Sun, ocean, clouds, and rivers are all part of one giant endless journey called the water cycle!',
  },
  {
    id: 'stages',
    number: 2,
    shortTitle: 'Ch 2 · Four Stages',
    title: 'Chapter 2: Understanding the Water Cycle',
    hookQuestion: 'How does liquid water climb up to the sky and return as rain?',
    summary:
      'Explore all four stages with live motion arrows and our Microscopic Zoom-In lens: Evaporation, Condensation, Precipitation, and Collection. Then complete Activity 1 and Activity 4!',
    mayaIntroScript:
      'Now let’s explore the four main stages of the water cycle one by one: Evaporation, Condensation, Precipitation, and Collection! Try clicking the Microscopic Zoom-In lens to see what tiny water particles do at each stage.',
  },
  {
    id: 'weather',
    number: 3,
    shortTitle: 'Ch 3 · Weather Lab',
    title: 'Chapter 3: What Is Weather?',
    hookQuestion: 'Why is one day sunny, another cloudy, and another rainy?',
    summary:
      'Weather is the condition of the atmosphere at a particular place and time. Switch live animated weather scenes to see Temperature, Humidity, Wind, Precipitation, and Cloud Cover in action!',
    mayaIntroScript:
      'Why is one day bright and sunny, another cloudy, and another stormy? Weather describes what the air around us is doing right now! Try switching the animated weather scenes and then test your skills in Activity 3: Weather Detective.',
  },
  {
    id: 'connection',
    number: 4,
    shortTitle: 'Ch 4 · Cycle + Weather',
    title: 'Chapter 4: How Are the Water Cycle and Weather Connected?',
    hookQuestion: 'How do the Sun’s heat and moving wind turn ocean water into today’s weather?',
    summary:
      'Use the live Sun Heat and Wind Speed simulator below! Watch evaporation rise, clouds form and drift with the wind, and temperature, humidity, and cloud cover change together.',
    mayaIntroScript:
      'Here is where everything clicks together! Adjust Sun Heat and Wind Speed in the simulator to watch how faster evaporation raises humidity, builds thicker clouds, and changes calm sunny skies into rainy or stormy weather.',
  },
  {
    id: 'real-world',
    number: 5,
    shortTitle: 'Ch 5 · Real World',
    title: 'Chapter 5: Real-World Application',
    hookQuestion: 'Where can you spot the water cycle right outside your home today?',
    summary:
      'Observe three everyday moments — a disappearing puddle, droplets on a cold glass, and gathering rain clouds — and identify the exact scientific process behind each one!',
    mayaIntroScript:
      'You don’t need an ocean to see the water cycle! Let’s inspect three everyday scenes — a sunny puddle, a cold glass of water, and dark storm clouds — and identify which water cycle process is happening in each.',
  },
  {
    id: 'knowledge-check',
    number: 6,
    shortTitle: 'Ch 6 · Quiz (5 Qs)',
    title: 'Chapter 6: Class 6 Knowledge Check',
    hookQuestion: 'Ready to check what you mastered about the Water Cycle and Weather?',
    summary:
      'Answer 5 quick questions covering the water cycle, its four stages, the role of the Sun, cloud formation, and how the water cycle shapes weather.',
    mayaIntroScript:
      'Awesome job reaching the final Knowledge Check! Take your time on these 5 Class 6 Science questions. I’ll give you clear feedback on every answer, and you can ask me anytime if something feels tricky!',
  },
];

export const WATER_CYCLE_STAGES: WaterCycleStageInfo[] = [
  {
    id: 'evaporation',
    letter: 'A',
    name: 'Evaporation',
    shortLabel: 'Evaporation',
    headline: 'Sun’s heat turns liquid water into invisible water vapour',
    explanation:
      'Warm sunlight heats water in oceans, rivers, and lakes. This heat energy turns liquid water into an invisible gas called water vapour, which rises up into the atmosphere.',
    keyTerm: 'Evaporation',
    keyTermDef: 'The process where heat turns liquid water into water vapour (gas).',
    microTitle: 'Microscopic View: Escaping Vapour',
    microExplanation:
      'When warmed by the Sun, liquid water particles jiggle faster and faster until they break free from the surface and float upward as spaced-out water vapour gas.',
    colorClass: 'amber',
  },
  {
    id: 'condensation',
    letter: 'B',
    name: 'Condensation',
    shortLabel: 'Condensation',
    headline: 'Cool high air turns water vapour back into tiny cloud droplets',
    explanation:
      'As warm water vapour rises high into the sky, the air becomes much cooler. The vapour cools down and changes back into tiny liquid water droplets that gather together to form clouds.',
    keyTerm: 'Condensation',
    keyTermDef: 'The cooling process where water vapour gas turns back into tiny liquid droplets.',
    microTitle: 'Microscopic View: Droplets Clustering',
    microExplanation:
      'In cool upper air, fast vapour particles lose heat, slow down, and cling around microscopic specks of dust to form tiny shining water droplets — millions together make a cloud!',
    colorClass: 'sky',
  },
  {
    id: 'precipitation',
    letter: 'C',
    name: 'Precipitation',
    shortLabel: 'Precipitation',
    headline: 'Heavy cloud droplets fall to Earth as rain, snow, or hail',
    explanation:
      'Inside clouds, tiny droplets bump into each other and join into bigger, heavier drops. When they become too heavy to stay floating in the air, gravity pulls them down as rain — or as snow or hail when the air is freezing!',
    keyTerm: 'Precipitation',
    keyTermDef: 'Water falling from clouds back to Earth as rain, snow, or hail.',
    microTitle: 'Microscopic View: Merging Heavy Drops',
    microExplanation:
      'Millions of microscopic cloud droplets collide and combine into larger, heavier raindrops (or icy snowflakes and hailstones in cold clouds) that fall downward.',
    colorClass: 'blue',
  },
  {
    id: 'collection',
    letter: 'D',
    name: 'Collection',
    shortLabel: 'Collection',
    headline: 'Rainwater gathers in rivers, lakes, oceans, and underground',
    explanation:
      'Fallen rainwater flows down hills and mountains into streams, rivers, lakes, and oceans. Some water also soaks into soil and rock underground. Then the Sun heats it again and the cycle repeats!',
    keyTerm: 'Collection',
    keyTermDef: 'The gathering of fallen water in rivers, lakes, oceans, and underground.',
    microTitle: 'Microscopic View: Flowing & Seeping',
    microExplanation:
      'Liquid water particles flow downhill together in rivers and trickle smoothly between tiny soil grains and rocks to refill underground water stores.',
    colorClass: 'emerald',
  },
];

export const WEATHER_ELEMENTS: WeatherElementInfo[] = [
  {
    id: 'temperature',
    name: 'Temperature',
    meaning: 'How hot or cold the air is.',
    unitHint: 'Measured in °C',
  },
  {
    id: 'humidity',
    name: 'Humidity',
    meaning: 'How much water vapour is present in the air.',
    unitHint: 'Measured in %',
  },
  {
    id: 'wind',
    name: 'Wind',
    meaning: 'The movement of air from one place to another.',
    unitHint: 'Measured in km/h',
  },
  {
    id: 'precipitation',
    name: 'Precipitation',
    meaning: 'Water falling from clouds as rain, snow, or hail.',
    unitHint: 'Rain / Snow / Hail',
  },
  {
    id: 'cloud-cover',
    name: 'Cloud Cover',
    meaning: 'How much of the sky is covered by clouds.',
    unitHint: 'Clear to Overcast %',
  },
];

export const WEATHER_CONDITIONS: WeatherConditionPreset[] = [
  {
    id: 'sunny',
    label: 'Sunny',
    temperatureC: 31,
    humidityPct: 38,
    windKmh: 8,
    cloudCoverPct: 10,
    precipitationLabel: 'None',
    description:
      'Bright sunshine warms the air with very few clouds in the sky and dry, light breezes.',
    primaryElements: ['temperature', 'cloud-cover'],
  },
  {
    id: 'cloudy',
    label: 'Cloudy',
    temperatureC: 23,
    humidityPct: 68,
    windKmh: 14,
    cloudCoverPct: 85,
    precipitationLabel: 'None yet',
    description:
      'Lots of condensed water droplets form thick clouds covering most of the sky and blocking direct sunlight.',
    primaryElements: ['cloud-cover', 'humidity'],
  },
  {
    id: 'rainy',
    label: 'Rainy',
    temperatureC: 19,
    humidityPct: 90,
    windKmh: 18,
    cloudCoverPct: 95,
    precipitationLabel: 'Steady Rain',
    description:
      'Humid air and heavy grey clouds release steady raindrops falling to the ground.',
    primaryElements: ['precipitation', 'humidity'],
  },
  {
    id: 'windy',
    label: 'Windy',
    temperatureC: 22,
    humidityPct: 48,
    windKmh: 42,
    cloudCoverPct: 40,
    precipitationLabel: 'None',
    description:
      'Fast-moving air pushes clouds rapidly across the sky and bends tree branches.',
    primaryElements: ['wind'],
  },
  {
    id: 'stormy',
    label: 'Stormy',
    temperatureC: 17,
    humidityPct: 95,
    windKmh: 58,
    cloudCoverPct: 100,
    precipitationLabel: 'Heavy Rain & Lightning',
    description:
      'Dark towering clouds, very high humidity, strong gusty winds, and heavy downpours happen together.',
    primaryElements: ['precipitation', 'wind'],
  },
];

export const ACTIVITY_1_EXPECTED_ORDER: WaterCycleStageId[] = [
  'evaporation',
  'condensation',
  'precipitation',
  'collection',
];

export const ACTIVITY_1_INITIAL_SHUFFLED: WaterCycleStageId[] = [
  'precipitation',
  'evaporation',
  'collection',
  'condensation',
];

export function evaluateWaterCycleOrder(order: WaterCycleStageId[]): {
  isCorrect: boolean;
  correctPositions: number;
  feedback: string;
} {
  let correctPositions = 0;
  for (let i = 0; i < ACTIVITY_1_EXPECTED_ORDER.length; i++) {
    if (order[i] === ACTIVITY_1_EXPECTED_ORDER[i]) {
      correctPositions++;
    }
  }
  const isCorrect =
    order.length === ACTIVITY_1_EXPECTED_ORDER.length &&
    correctPositions === ACTIVITY_1_EXPECTED_ORDER.length;

  if (isCorrect) {
    return {
      isCorrect: true,
      correctPositions,
      feedback:
        'Spot on! First the Sun causes Evaporation, then cool air causes Condensation into clouds, heavy droplets fall as Precipitation, and rainwater gathers during Collection!',
    };
  }

  return {
    isCorrect: false,
    correctPositions,
    feedback: `You have ${correctPositions} of 4 stages in the right spot. Hint: Start with the Sun heating ocean water (Evaporation), then forming clouds (Condensation), falling as rain (Precipitation), and flowing back into rivers & oceans (Collection).`,
  };
}

export const REAL_WORLD_SCENARIOS: RealWorldScenario[] = [
  {
    id: 'puddle',
    title: 'Scenario 1: The Disappearing Puddle',
    visualType: 'puddle',
    story:
      'After morning rain, a shallow puddle sits on the school playground. By a sunny afternoon, the puddle has completely vanished!',
    correctProcess: 'evaporation',
    explanation:
      'This is Evaporation! Heat from the afternoon Sun warmed the liquid water in the puddle and turned it into invisible water vapour that rose into the air.',
  },
  {
    id: 'cold-glass',
    title: 'Scenario 2: Droplets on a Cold Glass',
    visualType: 'cold-glass',
    story:
      'You pour ice-cold lemonade into a dry glass on a warm day. Two minutes later, tiny sparkling water droplets appear on the outside of the glass.',
    correctProcess: 'condensation',
    explanation:
      'This is Condensation! Warm invisible water vapour in the room touched the cold outside surface of the glass, cooled down, and turned back into liquid water droplets.',
  },
  {
    id: 'dark-clouds',
    title: 'Scenario 3: Dark Clouds & Afternoon Rain',
    visualType: 'dark-clouds',
    story:
      'Thick grey clouds pack together across the sky. Suddenly, big raindrops begin pattering down onto rooftops and trees.',
    correctProcess: 'precipitation',
    explanation:
      'This is Cloud Formation leading to Precipitation! Tiny condensed water droplets joined together inside the clouds until they grew too heavy to stay up and fell as rain.',
  },
];

export function evaluateProcessIdentification(
  scenarioId: string,
  chosen: 'evaporation' | 'condensation' | 'precipitation'
): { isCorrect: boolean; feedback: string } {
  const scenario = REAL_WORLD_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    return { isCorrect: false, feedback: 'Select a scenario to test.' };
  }
  const isCorrect = scenario.correctProcess === chosen;
  if (isCorrect) {
    return {
      isCorrect: true,
      feedback: `Correct! ${scenario.explanation}`,
    };
  }
  return {
    isCorrect: false,
    feedback: `Not quite "${chosen}". Look closely at what happened to the water: ${scenario.explanation}`,
  };
}

export const WEATHER_DETECTIVE_CASES: WeatherDetectiveCase[] = [
  {
    id: 'det-1',
    clueTitle: 'Case 1: Playground Breeze Mystery',
    scene: 'windy',
    clues: [
      'Trees are leaning sideways and kites soar high!',
      'Air speed meter reads 42 km/h.',
      'No rain is falling and temperature is mild (22°C).',
    ],
    correctCondition: 'windy',
    correctElement: 'wind',
    explanation:
      'Great detective work! Leaning trees and a 42 km/h reading point to Windy weather, caused mainly by fast-moving air (Wind).',
  },
  {
    id: 'det-2',
    clueTitle: 'Case 2: Wet Umbrella Afternoon',
    scene: 'rainy',
    clues: [
      'Humidity climbs to 90% and sky is 95% covered in grey clouds.',
      'Steady water drops are falling onto the streets.',
      'Air feels cool at 19°C.',
    ],
    correctCondition: 'rainy',
    correctElement: 'precipitation',
    explanation:
      'Spot on! High humidity and heavy clouds releasing steady drops mean Rainy weather, driven by Precipitation.',
  },
  {
    id: 'det-3',
    clueTitle: 'Case 3: Bright Summer Picnic',
    scene: 'sunny',
    clues: [
      'Thermometer climbs to 31°C.',
      'Sky is 90% clear with only tiny wispy clouds.',
      'Puddles dry up quickly in the bright sunlight.',
    ],
    correctCondition: 'sunny',
    correctElement: 'temperature',
    explanation:
      'Correct! Clear skies and a warm 31°C thermometer reading show Sunny weather where high Temperature is a key element.',
  },
];

export function evaluateWeatherDetective(
  caseId: string,
  chosenCondition: WeatherConditionId,
  chosenElement: WeatherElementId
): { isCorrect: boolean; feedback: string } {
  const target = WEATHER_DETECTIVE_CASES.find((c) => c.id === caseId);
  if (!target) return { isCorrect: false, feedback: 'Unknown detective case.' };

  const condMatch = target.correctCondition === chosenCondition;
  const elemMatch = target.correctElement === chosenElement;

  if (condMatch && elemMatch) {
    return { isCorrect: true, feedback: target.explanation };
  }
  if (condMatch && !elemMatch) {
    return {
      isCorrect: false,
      feedback: `You spotted the ${target.correctCondition} weather right! Now double-check which main weather element caused those clues (hint: look at the instrument reading).`,
    };
  }
  if (!condMatch && elemMatch) {
    return {
      isCorrect: false,
      feedback: `Nice job identifying the weather element! Now look at the animated sky to match the overall weather condition.`,
    };
  }
  return {
    isCorrect: false,
    feedback: `Check the clues again! ${target.explanation}`,
  };
}

export const PREDICT_NEXT_CASES: PredictNextCase[] = [
  {
    id: 'pred-1',
    pausedAtStage: 'evaporation',
    sceneDescription:
      'Paused right after warm water vapour rises high into the cold upper sky.',
    question: 'What happens next when this rising water vapour cools down?',
    correctNextStage: 'condensation',
    explanation:
      'Condensation happens next! Cool high-altitude air turns the rising water vapour back into tiny liquid water droplets that gather into clouds.',
  },
  {
    id: 'pred-2',
    pausedAtStage: 'condensation',
    sceneDescription:
      'Paused as millions of cloud droplets bump together and grow heavy and dark.',
    question: 'What happens next when cloud droplets get too heavy to float?',
    correctNextStage: 'precipitation',
    explanation:
      'Precipitation happens next! Gravity pulls the heavy water droplets down to Earth as rain, snow, or hail.',
  },
  {
    id: 'pred-3',
    pausedAtStage: 'precipitation',
    sceneDescription:
      'Paused as rainwater lands on mountainsides and trickles downhill.',
    question: 'Which stage happens next as water gathers in rivers, lakes, and oceans?',
    correctNextStage: 'collection',
    explanation:
      'Collection happens next! Rainwater flows into streams, rivers, oceans, and underground stores — ready for the Sun to start Evaporation again.',
  },
];

export function evaluatePredictNext(
  caseId: string,
  predictedStage: WaterCycleStageId
): { isCorrect: boolean; feedback: string } {
  const item = PREDICT_NEXT_CASES.find((c) => c.id === caseId);
  if (!item) return { isCorrect: false, feedback: 'Select a prediction challenge.' };
  const isCorrect = item.correctNextStage === predictedStage;
  return {
    isCorrect,
    feedback: isCorrect
      ? `Great prediction! ${item.explanation}`
      : `Good try! Think about what happens right after ${item.pausedAtStage}: ${item.explanation}`,
  };
}

export function computeConnectedWeather(
  sunHeat: 'low' | 'medium' | 'high',
  windSpeed: 'calm' | 'breezy' | 'strong'
): ConnectedWeatherSimulation {
  if (sunHeat === 'high' && windSpeed === 'strong') {
    return {
      condition: 'stormy',
      label: 'Stormy & Heavy Rain',
      temperatureC: 24,
      humidityPct: 94,
      windKmh: 56,
      cloudCoverPct: 100,
      evaporationRate: 'High',
      precipitationForm: 'Heavy Rain & Storm',
      explanation:
        'Intense Sun heat drives rapid evaporation, packing the air with humidity. Strong winds push massive condensed clouds together, unleashing heavy rain and stormy gusts!',
    };
  }
  if (sunHeat === 'high' && windSpeed === 'breezy') {
    return {
      condition: 'rainy',
      label: 'Warm & Rainy',
      temperatureC: 26,
      humidityPct: 86,
      windKmh: 24,
      cloudCoverPct: 90,
      evaporationRate: 'High',
      precipitationForm: 'Light Rain',
      explanation:
        'Strong sunlight evaporates plenty of ocean water into humid air. Rising vapour condenses into thick clouds that drift inland with the breeze and drop steady rain.',
    };
  }
  if (sunHeat === 'high' && windSpeed === 'calm') {
    return {
      condition: 'sunny',
      label: 'Hot, Sunny & Rising Vapour',
      temperatureC: 33,
      humidityPct: 58,
      windKmh: 6,
      cloudCoverPct: 22,
      evaporationRate: 'High',
      precipitationForm: 'None',
      explanation:
        'High Sun heat warms the air to 33°C and speeds up evaporation! With calm winds, scattered fluffy clouds are just beginning to build overhead.',
    };
  }
  if (sunHeat === 'medium' && windSpeed === 'strong') {
    return {
      condition: 'windy',
      label: 'Breezy & Partly Cloudy',
      temperatureC: 21,
      humidityPct: 54,
      windKmh: 44,
      cloudCoverPct: 55,
      evaporationRate: 'Moderate',
      precipitationForm: 'None',
      explanation:
        'Moderate evaporation forms light clouds while strong winds sweep them briskly across the mountains before heavy rain clouds can pile up.',
    };
  }
  if (sunHeat === 'medium' && windSpeed === 'breezy') {
    return {
      condition: 'cloudy',
      label: 'Mild & Cloudy',
      temperatureC: 23,
      humidityPct: 72,
      windKmh: 16,
      cloudCoverPct: 80,
      evaporationRate: 'Moderate',
      precipitationForm: 'None',
      explanation:
        'Steady Sun warmth evaporates water at a medium pace. Vapour cools and condenses into wide white clouds covering 80% of the sky, keeping temperatures mild.',
    };
  }
  if (sunHeat === 'low' && windSpeed === 'strong') {
    return {
      condition: 'windy',
      label: 'Cool & Windy',
      temperatureC: 15,
      humidityPct: 45,
      windKmh: 48,
      cloudCoverPct: 65,
      evaporationRate: 'Low',
      precipitationForm: 'None',
      explanation:
        'With gentle sunlight, evaporation is slow and temperatures stay cool (15°C), while strong moving air creates a brisk, windy day.',
    };
  }
  return {
    condition: sunHeat === 'low' ? 'cloudy' : 'sunny',
    label: sunHeat === 'low' ? 'Cool & Calm Overcast' : 'Calm & Mostly Sunny',
    temperatureC: sunHeat === 'low' ? 16 : 27,
    humidityPct: sunHeat === 'low' ? 60 : 48,
    windKmh: 8,
    cloudCoverPct: sunHeat === 'low' ? 70 : 30,
    evaporationRate: sunHeat === 'low' ? 'Low' : 'Moderate',
    precipitationForm: 'None',
    explanation:
      sunHeat === 'low'
        ? 'Low Sun heat slows evaporation down, leaving cool air and quiet lingering clouds with calm winds.'
        : 'Comfortable warmth causes steady gentle evaporation with clear blue patches and calm air.',
  };
}

export const KNOWLEDGE_CHECK_QUESTIONS: WaterCycleQuizQuestion[] = [
  {
    id: 'wc-q1',
    conceptTag: 'Meaning of Water Cycle',
    prompt: 'What is the water cycle?',
    options: [
      'A machine that cleans tap water in cities',
      'The continuous movement of water between Earth’s surface and the atmosphere',
      'A seasonal storm that only happens over oceans',
      'The way rivers freeze during winter months',
    ],
    correctIndex: 1,
    explanation:
      'The water cycle is the endless loop in which water moves continuously between Earth’s surface (oceans, rivers, land) and the atmosphere.',
  },
  {
    id: 'wc-q2',
    conceptTag: 'Role of the Sun',
    prompt: 'What main energy source drives evaporation in the water cycle?',
    options: [
      'The Moon’s gravity',
      'Ocean waves crashing on beaches',
      'Heat energy from the Sun',
      'Tree roots drinking rainwater',
    ],
    correctIndex: 2,
    explanation:
      'The Sun provides the heat energy that warms liquid water in oceans, rivers, and lakes and turns it into rising water vapour!',
  },
  {
    id: 'wc-q3',
    conceptTag: 'Cloud Formation',
    prompt: 'How do clouds form high up in the sky?',
    options: [
      'Rising water vapour cools down and condenses into tiny liquid water droplets',
      'Wind blows white ocean foam straight up into the sky',
      'Rainwater freezes underground and floats upward',
      'Sunlight turns solid rocks into floating mist',
    ],
    correctIndex: 0,
    explanation:
      'As warm water vapour rises into cooler air, condensation turns it back into millions of tiny water droplets that gather together to form clouds.',
  },
  {
    id: 'wc-q4',
    conceptTag: 'Stages of the Water Cycle',
    prompt: 'Which sequence shows the four stages of the water cycle in the right order?',
    options: [
      'Collection → Precipitation → Condensation → Evaporation',
      'Condensation → Evaporation → Collection → Precipitation',
      'Evaporation → Condensation → Precipitation → Collection',
      'Precipitation → Collection → Condensation → Evaporation',
    ],
    correctIndex: 2,
    explanation:
      'Liquid water evaporates into vapour, condenses into clouds, falls back to Earth as precipitation, and collects in rivers, lakes, and oceans!',
  },
  {
    id: 'wc-q5',
    conceptTag: 'Water Cycle & Weather',
    prompt: 'How does faster evaporation on a very hot day affect local weather?',
    options: [
      'It removes all humidity from the air permanently',
      'It increases humidity and can build thicker clouds that bring rain',
      'It stops wind from blowing anywhere on Earth',
      'It immediately freezes lakes into solid ice',
    ],
    correctIndex: 1,
    explanation:
      'More evaporation puts more water vapour into the air (higher humidity). When that humid air rises and cools, thicker clouds form and can produce rain or storms!',
  },
];

export function scoreKnowledgeCheck(answers: Record<string, number>): {
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  percent: number;
} {
  const totalQuestions = KNOWLEDGE_CHECK_QUESTIONS.length;
  let answeredCount = 0;
  let correctCount = 0;

  for (const q of KNOWLEDGE_CHECK_QUESTIONS) {
    if (typeof answers[q.id] === 'number') {
      answeredCount++;
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    }
  }

  return {
    answeredCount,
    correctCount,
    totalQuestions,
    percent: Math.round((correctCount / totalQuestions) * 100),
  };
}

export function isWaterCycleSession(session: StartSessionInput): boolean {
  if (session.problemSolver) return false;
  const topic = session.topic.toLowerCase();
  const subject = session.subject.toLowerCase();
  return (
    topic.includes('water cycle') ||
    (subject.includes('science') &&
      (topic.includes('water') || topic.includes('weather') || topic.includes('evaporation')))
  );
}
