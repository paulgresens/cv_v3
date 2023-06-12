import { PDFFont } from "pdf-lib";

export const getLines = (
  value: string,
  from: number,
  to: number,
  fontSize: number,
  font: PDFFont
) => {
  let text = "";
  const textArr = [...value.split("")].reduce(
    (acc: string[], char, i: number, arr: string[]) => {
      const nextText = text + char;
      const width = font.widthOfTextAtSize(nextText, fontSize - 3);
      if (width > from && width < to) {
        acc.push(
          (
            nextText + `${char.match(" ") || arr[i + 1].match(" ") ? "" : "-"}`
          ).trim()
        );
        text = "";
      } else {
        text = nextText;
      }

      return acc;
    },
    []
  );
  textArr.push(text);
  return textArr;
};
