import {
  capitalize,
  trim,
  identity,
  normalizeTemplateValue,
  clamp,
} from "../../utils";
import { DEFAULT } from "./constants";
import {
  CustomTableMode,
  CustomTableTemplate,
  CustomTable,
  CustomTableCurves,
} from "./types";

export const parseFileContent = (data: {
  content: string;
  templates: CustomTableTemplate[];
  values: CustomTable;
  curves: CustomTableCurves;
}): CustomTableMode => {
  const { content, templates, values, curves } = data;

  let mode: CustomTableMode = "default";

  if (!content) return mode;

  const lines = content.split("\n").map(trim).filter(identity);

  let currentKey = "";
  let readingProperties = false;

  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i];

    // Switch properties parsing mode
    if (i == 0 && line === "---") {
      readingProperties = true;
      continue;
    } else if (readingProperties && line === "---") {
      readingProperties = false;
      continue;
    }

    // New template
    if (readingProperties) {
      const templateKey = line.substring(0, line.indexOf(":"));
      const timesMatch = templateKey.match(/ x\d+$/);

      let templateValue = line.substring(line.indexOf(":") + 1).trim();
      // Multiline value
      if (templateValue === "|-") {
        i++;
        const newTemplateValue: string[] = [];
        while (!lines[i].includes(":") && lines[i] !== "---") {
          let newLine = lines[i].trim();
          newLine = normalizeTemplateValue(newLine);
          if (newLine) {
            newTemplateValue.push(newLine);
          }
          i++;
        }
        templateValue = newTemplateValue.join("<br/>");
        i--;
      }
      // Remove wrapping quotation marks
      templateValue = normalizeTemplateValue(templateValue);

      // Ignore blank templates
      if (!templateValue) continue;

      templateValue = templateValue.replace(/\\"/g, '"').replace(/\\'/g, "'");

      let templateRepeat = 1;
      let templateUpcase = false;
      let templateCapitalize = false;

      if (
        templateKey.toLowerCase().trim() === "mode" &&
        templateValue.toLowerCase().trim() === "cutup"
      ) {
        mode = "cutup";
      } else if (
        templateKey.toLowerCase().trim() === "mode" &&
        templateValue.toLowerCase().trim() === "markov"
      ) {
        mode = "markov";
      } else if (templateKey.length > 1 && timesMatch) {
        templateRepeat = clamp({
          value: parseInt(timesMatch[0].replace(" x", "")),
          min: 1,
          max: 20,
        });
      } else if (
        templateKey.length > 1 &&
        templateKey === templateKey.toUpperCase()
      ) {
        templateValue = templateValue.toLowerCase();
        templateUpcase = true;
      } else if (
        templateKey.length > 1 &&
        templateKey === capitalize(templateKey)
      ) {
        templateValue = templateValue.toLowerCase();
        templateCapitalize = true;
      }

      templates.push({
        value: templateValue,
        capitalize: templateCapitalize,
        upcase: templateUpcase,
        repeat: templateRepeat,
      });

      continue;
    }

    // Treat headers as template keys
    if (line.startsWith("#")) {
      const [key, curve] = parseKeyWithCurve(
        line.replace(/#/g, "").trim().toLowerCase()
      );

      currentKey = key;
      values[currentKey] = [];
      curves[currentKey] = curve;
      continue;
    }

    if (mode === "default") {
      values[DEFAULT].push(line);
      if (currentKey) values[currentKey].push(line);
    } else if (mode === "cutup") {
      values[DEFAULT].push(...line.split(/ +/).filter(Boolean));
    } else if (mode === "markov") {
      values[DEFAULT].push(
        ...line
          .split(/ +/)
          .map((word) => word.replace(/[^\w\d']/g, "").trim())
          .filter(Boolean)
      );
    }
  }

  return mode;
};

export const parseKeyWithCurve = (value: string): [string, number] => {
  const match = value.match(/ \d+d$/i);
  if (match) {
    return [
      value.replace(match[0], "").trim(),
      parseInt(match[0].replace(/\D/g, "")),
    ];
  } else {
    return [value, 1];
  }
};
