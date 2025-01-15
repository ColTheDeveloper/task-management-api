import fs from 'fs';

export const loadHtmlTemplate = (templateName: string, replacements: { [key: string]: string }): string => {


  const filePath = `./src/templates/${templateName}.html`;
  let htmlContent = fs.readFileSync(filePath, 'utf-8');

  // Replace placeholders with actual values
  for (const [key, value] of Object.entries(replacements)) {
    htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return htmlContent
};