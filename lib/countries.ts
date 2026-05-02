export interface CountryDef {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryDef[] = [
  { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "GB", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" },
  { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "NG", name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },
  { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}" },
  { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
  { code: "NO", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}" },
  { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}" },
  { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
];

export function findCountry(code: string): CountryDef | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}
