export const MAX_REMEMBER_SIZE = 100;
export const DEFAULT = "DEFAULT";

export const wordLabels: { [word: string]: string } = {
  promptSubject: "Subject",
  promptAction: "Action",
  promptGoal: "Goal",

  npcName: "Name",
  npcAspects: "Aspects",
  npcSkills: "Skills",
  npcJob: "Occupation",

  locName: "Name",
  locDescription: "Description",
  locBuilding: "Town",
  locWilderness: "Wilderness",
};

export const wordTooltips: { [word: string]: string } = {
  promptSubject: "a subject",
  promptAction: "an action",

  npcName: "a name",
  npcAspects: "character aspects",
  npcSkills: "character skills",
  npcJob: "an occupation",

  locName: "a town name",
  locDescription: "generic description",
  locBuilding: "town encounter",
  locWilderness: "wilderness encounter",
};
