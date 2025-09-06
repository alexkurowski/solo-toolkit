import {
  capitalize,
  trim,
  identity,
  normalizeTemplateValue,
  clamp,
  removeBy,
} from "../../utils";
import { DEFAULT } from "./constants";
import {
  CustomTableMode,
  CustomTableTemplate,
  CustomTable,
  CustomTableCurves,
} from "./types";
import { SoloToolkitSettings } from "../../settings/index";

export const parseFileContent = (
  content: string,
  settings: SoloToolkitSettings
): {
  mode: CustomTableMode;
  templates: CustomTableTemplate[];
  values: CustomTable;
  curves: CustomTableCurves;
} => {
  let mode: CustomTableMode = "default";
  const templates: CustomTableTemplate[] = [];
  const values: CustomTable = { [DEFAULT]: [] };
  const curves: CustomTableCurves = {};

  if (!content) {
    return {
      mode,
      templates,
      values,
      curves,
    };
  }

  const lines = content.split("\n").map(trim).filter(identity);

  let currentKey = "";
  let readingProperties = false;

  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i];

    // Switch properties parsing mode
    // TODO: frontmatter
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
      const weightMatch = templateKey.match(/ \^\d+$/);

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

      // Save blank template if it starts with correct prefix
      if (
        !templateValue &&
        settings.templatePrefix &&
        templateKey.startsWith(settings.templatePrefix)
      ) {
        templateValue = "{DEFAULT}";
      }

      // Ignore blank templates
      if (!templateValue) continue;

      templateValue = templateValue.replace(/\\"/g, '"').replace(/\\'/g, "'");

      let templateRepeat = 1;
      let templateWeight = 0;
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
      } else if (templateKey.length > 1 && weightMatch) {
        templateWeight = clamp({
          value: parseInt(weightMatch[0].replace(" ^", "")) - 1,
          min: 0,
          max: 999,
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
        key: templateKey,
        value: templateValue,
        capitalize: templateCapitalize,
        upcase: templateUpcase,
        repeat: templateRepeat,
      });

      if (templateWeight && templateWeight > 0) {
        for (let i = 0; i < templateWeight; i++) {
          templates.push({
            key: templateKey,
            value: templateValue,
            capitalize: templateCapitalize,
            upcase: templateUpcase,
            repeat: templateRepeat,
          });
        }
      }

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

  // Remove template based on prefix
  if (templates.length && settings.templatePrefix) {
    const templatesWithPrefix = templates.filter((template) =>
      template.key.startsWith(settings.templatePrefix)
    ).length;
    const templatesWithoutPrefix = templates.filter(
      (template) => !template.key.startsWith(settings.templatePrefix)
    ).length;
    if (templatesWithPrefix && templatesWithoutPrefix) {
      removeBy(
        templates,
        (template) => !template.key.startsWith(settings.templatePrefix)
      );
    }
  }

  // Assign weight for each list
  if (mode === "default") {
    for (const key in values) {
      const total = values[key].length;
      if (total === 0) continue;
      for (let index = 0; index < total; index++) {
        const value = values[key][index];
        const match = value.match(/ +[\^!]\d+$/);
        if (match) {
          const times = parseInt(match[0].replace(/\D/g, ""));
          if (times && times > 0) {
            const newValue = value.replace(match[0], "");
            values[key][index] = newValue;
            for (let i = 0; i < times - 1; i++) {
              values[key].push(newValue);
            }
          }
        }
      }
    }
  }

  return {
    mode,
    templates,
    values,
    curves,
  };
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
