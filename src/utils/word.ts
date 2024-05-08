import { dictionary } from "./dictionary";
import { randomFrom } from "./dice";
import { capitalize } from "./helpers";

const getNoun = () => randomFrom(dictionary.nouns);
const getVerb = () => randomFrom(dictionary.verbs);
const getAdjective = () => randomFrom(dictionary.adjectives);
const getAdverb = () => randomFrom(dictionary.adverbs);

const getSubject = () => capitalize(`${getAdjective()} ${getNoun()}`);
const getAction = () => capitalize(`${getVerb()} ${getAdverb()}`);

const getName1 = () => {
  let result = "";

  let i, j;
  const syllables = randomFrom([1, 2, 2, 2, 2, 2, 2, 3, 3, 4]);
  for (let syllable = 0; syllable < syllables; syllable++) {
    i = Math.floor(Math.random() * dictionary.names1.length);
    j = Math.floor(Math.random() * dictionary.names1[i].length);
    result += dictionary.names1[i][j];
  }

  return capitalize(result);
};

const getName2 = () => {
  let result = "";

  let i, j;
  const syllables = randomFrom([1, 2, 2, 2, 2, 2, 2, 3, 3, 4]);
  for (let syllable = 0; syllable < syllables; syllable++) {
    i = Math.floor(Math.random() * dictionary.names2.length);
    j = Math.floor(Math.random() * dictionary.names2[i].length);
    result += dictionary.names2[i][j];
  }

  return capitalize(result);
};

const getName3 = () => {
  let result = "";

  let i = 0;
  let toAdd: any;
  let type: "vowel" | "consonant" = "vowel";
  const syllables = randomFrom([
    1, 2, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9,
  ]);
  for (let syllable = 0; syllable < syllables; syllable++) {
    try {
      do {
        i = Math.floor(Math.random() * dictionary.names3[type].length);
        toAdd = dictionary.names3[type][i];
        // Check if valid syllable location
        if (syllable === 0) {
          // first syllable
          if (toAdd[1] & 2) break;
        } else if (syllable === syllables - 1) {
          // last syllable
          if (toAdd[1] & 1) break;
        } else {
          // middle syllable
          if (toAdd[1] & 4) break;
        }
      } while (true);
    } catch (err) {
      console.log(err);
      console.log({ type, i, toAdd });
    }
    result += toAdd[0];
    type = type === "vowel" ? "consonant" : "vowel";
  }

  return capitalize(result);
};

const getNames = [getName1, getName2, getName3];
let getNamesIndex = 0;
const getSomeName = () => {
  const callback = getNames[getNamesIndex++ % getNames.length];

  if (Math.random() > 0.9) {
    return `${callback()} ${callback()} ${callback()}`;
  } else {
    return `${callback()} ${callback()}`;
  }
};

const getJob = () => capitalize(randomFrom(dictionary.occupations));

const getAspects = () => {
  const word1 = randomFrom(dictionary.descriptors);
  const word2 = randomFrom(dictionary.descriptors, word1);

  return capitalize(`${word1} and ${word2}`);
};

const getSkills = () => {
  const good = randomFrom(dictionary.skills);
  const bad = randomFrom(dictionary.skills, good);

  const [goodSkill, goodType] = good;
  const [badSkill, badType] = bad;

  let goodStr = `good ${goodSkill}`;
  if (goodType === 0) goodStr = `good ${goodSkill} skills`;
  if (goodType === 1) goodStr = `good at ${goodSkill}`;
  if (goodType === 2) goodStr = `good with ${goodSkill}`;
  let badStr = `bad ${badSkill}`;
  if (badType === 0) badStr = `bad ${badSkill} skills`;
  if (badType === 1) badStr = `bad at ${badSkill}`;
  if (badType === 2) badStr = `bad with ${badSkill}`;

  return capitalize(`${goodStr} but ${badStr}`);
};

const getTown = () =>
  capitalize(
    randomFrom(dictionary.settlement[0]) + randomFrom(dictionary.settlement[1]),
  );

export const generateWord = (type: string): string => {
  switch (type) {
    case "Subject":
      return getSubject();
    case "Action":
      return getAction();
    case "Name":
      return getSomeName();
    case "Aspects":
      return getAspects();
    case "Skills":
      return getSkills();
    case "Job":
      return getJob();
    case "Town":
      return getTown();
    default:
      return "";
  }
};
