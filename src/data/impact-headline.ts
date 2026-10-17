export type ImpactTone = "bone" | "lime";

export type ImpactToken = {
  text: string;
  tone?: ImpactTone;
  serif?: boolean;
};

export type ImpactLine = ImpactToken[];

export const impactLines: ImpactLine[] = [
  [{ text: "BUILDING", tone: "lime", serif: true }, { text: "DIGITAL" }],
  [{ text: "EXPERIENCES," }],
  [
    { text: "CRAFTING" },
    { text: "IDEAS", tone: "lime" },
    { text: "INTO" },
  ],
  [
    { text: "REALITY,", tone: "lime", serif: true },
    { text: "AND" },
    { text: "TURNING" },
  ],
  [
    { text: "CODE" },
    { text: "INTO" },
    { text: "SOMETHING", serif: true },
  ],
  [{ text: "MEANINGFUL." }],
];
