/**
 * Score → percentile from published scaled-score tables, one curve per CAT year.
 * Sources: Cracku (2017, 2021, 2024, 2025), BYJU'S / Career Launcher (2018, 2019),
 * InsideIIM (2022, 2023). These are scaled scores after slot normalisation, not a
 * raw cutoff for one slot. A raw score on a single slot is only a stand-in.
 *
 * Section tables for 2022–2025 are published. For 2017–2021 the section shape is
 * the 2022 section table, stretched so each section's 99 sits in the same ratio
 * to that year's overall 99 as it did in 2022.
 */

const OVERALL = {
  2017: [[93, 80], [105, 85], [118, 90], [139, 95], [160, 98], [174, 99], [185, 99.5], [202, 99.7], [209, 99.9]],
  2018: [[80, 80], [110, 90], [125, 95], [155, 99], [170, 99.5], [192, 99.9]],
  2019: [[75, 80], [90, 90], [120, 95], [157, 99], [170, 99.5], [196, 99.9]],
  2020: [[48, 80], [63, 90], [76, 95], [85, 97], [101, 99], [115, 99.5], [130, 99.9]],
  2021: [[45, 80], [60, 90], [73, 95], [82, 97], [98, 99], [110, 99.5], [124, 99.9]],
  2022: [[29, 70], [36.02, 80], [41.32, 85], [48.44, 90], [60, 95], [73.88, 98], [83.64, 99], [92.87, 99.5], [109.9, 99.9]],
  2023: [[38.94, 70], [40.02, 75], [41.19, 80], [42.29, 85], [45.16, 90], [46.13, 91], [51.95, 92], [52.35, 93], [53.32, 94], [54.86, 95], [58.1, 96], [61.56, 97], [66.68, 98], [71.15, 98.5], [76.02, 99], [84.29, 99.5], [101.43, 99.9], [106.95, 99.95]],
  2024: [[19.5, 60], [25.3, 70], [37, 75], [44, 80], [49, 85], [50.29, 86], [58, 90], [64, 93], [70, 95], [78.9, 97], [95.13, 99], [103.97, 99.5], [127, 99.9]],
  2025: [[20, 55], [23, 60], [26, 65], [29.5, 70], [33, 75], [38, 80], [44.2, 85], [51.5, 90], [62.3, 95], [70, 97], [76, 98], [84.8, 99], [93, 99.5], [111.48, 99.9], [118.37, 99.95], [132.79, 99.99]],
};

const PAPER = {
  2017: { overall: 300, VARC: 102, DILR: 96, Quant: 102 },
  2018: { overall: 300, VARC: 102, DILR: 96, Quant: 102 },
  2019: { overall: 300, VARC: 102, DILR: 96, Quant: 102 },
  2020: { overall: 228, VARC: 78, DILR: 72, Quant: 78 },
  2021: { overall: 198, VARC: 72, DILR: 60, Quant: 66 },
  2022: { overall: 198, VARC: 72, DILR: 60, Quant: 66 },
  2023: { overall: 198, VARC: 72, DILR: 60, Quant: 66 },
  2024: { overall: 204, VARC: 72, DILR: 66, Quant: 66 },
  2025: { overall: 204, VARC: 72, DILR: 66, Quant: 66 },
};

// 2022 QA 99 is the cited ~44. The rest of that column is the 2023 QA shape
// moved so its 99 lands on 44.3. VARC and DILR are InsideIIM's 2022 cutoffs.
const SECTION_2022 = {
  VARC: [[17, 80], [21, 85], [24, 90], [28, 95], [40, 99]],
  DILR: [[13, 80], [14, 85], [18, 90], [21, 95], [30, 99]],
  Quant: [[16.2, 80], [23.9, 90], [29.6, 95], [44.3, 99], [49.7, 99.5], [61.4, 99.9]],
};

const SECTION = {
  2022: SECTION_2022,
  2023: {
    VARC: [[17.58, 80], [23.37, 90], [28.78, 95], [39.83, 99], [44, 99.5], [51.14, 99.9], [58.2, 99.99]],
    DILR: [[11.67, 80], [15.63, 90], [18.92, 95], [27.29, 99], [30.58, 99.5], [36.58, 99.9], [42.66, 99.99]],
    Quant: [[9.2, 80], [13.63, 90], [16.87, 95], [25.2, 99], [28.28, 99.5], [34.96, 99.9], [44.89, 99.99]],
  },
  2024: {
    VARC: [[15.6, 75], [18.2, 80], [20.42, 85], [24, 90], [30, 95], [33.54, 97], [40.3, 99], [44, 99.5], [55, 99.9]],
    DILR: [[14.95, 75], [17, 80], [19.5, 85], [22.5, 90], [27, 95], [30.8, 97], [37.8, 99], [41.4, 99.5], [50.1, 99.9]],
    Quant: [[9.92, 75], [11.6, 80], [13.7, 85], [17, 90], [22, 95], [25, 97], [33, 99], [36.5, 99.5], [45, 99.9]],
  },
  2025: {
    VARC: [[11, 60], [19, 80], [22, 85], [26, 90], [32.5, 95], [44, 99], [48, 99.5], [53, 99.9]],
    DILR: [[8.5, 70], [11.5, 80], [14, 85], [16.7, 90], [21.5, 95], [29.8, 99], [33, 99.5], [38, 99.9]],
    Quant: [[7.1, 70], [10, 80], [12, 85], [15, 90], [18.5, 95], [27.3, 99], [31.2, 99.5], [37, 99.9]],
  },
};

function scoreAt(table, percentile) {
  for (let i = 0; i < table.length; i++) {
    if (table[i][1] === percentile) return table[i][0];
  }
  return null;
}

function stretchSection(year, section) {
  const paper = PAPER[year];
  const ref = PAPER[2022];
  const factor = (paper[section] / ref[section])
    * (scoreAt(OVERALL[year], 99) / paper.overall)
    / (scoreAt(OVERALL[2022], 99) / ref.overall);
  return SECTION_2022[section].map(([score, percentile]) => [
    Math.round(score * factor * 10) / 10,
    percentile,
  ]);
}

for (const year of [2017, 2018, 2019, 2020, 2021]) {
  SECTION[year] = {
    VARC: stretchSection(year, 'VARC'),
    DILR: stretchSection(year, 'DILR'),
    Quant: stretchSection(year, 'Quant'),
  };
}

export function bandYear(year) {
  const y = Number(year);
  return OVERALL[y] ? y : 2025;
}

export function sectionSeconds(year) {
  const y = Number(year);
  if (y >= 2017 && y <= 2019) return 60 * 60;
  return 40 * 60;
}

export function sectionMinutes(year) {
  return sectionSeconds(year) / 60;
}

function lookup(table, score) {
  if (!table || table.length === 0) return 0;
  const first = table[0];
  const last = table[table.length - 1];
  if (score >= last[0]) return Math.min(99.99, last[1]);
  if (score <= first[0]) {
    if (first[0] <= 0) return first[1];
    const floor = 15;
    const t = Math.max(0, score) / first[0];
    const value = floor + t * (first[1] - floor);
    return Math.max(1, Math.min(first[1], value));
  }
  for (let i = 1; i < table.length; i++) {
    const [s0, p0] = table[i - 1];
    const [s1, p1] = table[i];
    if (score <= s1) {
      const t = (score - s0) / (s1 - s0);
      return p0 + t * (p1 - p0);
    }
  }
  return Math.min(99.99, last[1]);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function estimatePercentile(score, year) {
  return round1(lookup(OVERALL[bandYear(year)], Number(score) || 0));
}

export function estimateSectionPercentile(section, score, year) {
  const table = SECTION[bandYear(year)]?.[section];
  return round1(lookup(table, Number(score) || 0));
}

export function marksAtPercentile(year, percentile) {
  const table = OVERALL[bandYear(year)];
  if (percentile <= table[0][1]) return table[0][0];
  const last = table[table.length - 1];
  if (percentile >= last[1]) return last[0];
  for (let i = 1; i < table.length; i++) {
    const [s0, p0] = table[i - 1];
    const [s1, p1] = table[i];
    if (percentile <= p1) {
      if (p1 === p0) return s1;
      const t = (percentile - p0) / (p1 - p0);
      return s0 + t * (s1 - s0);
    }
  }
  return last[0];
}

export const DISPLAY_BANDS = [99.5, 99, 95, 90, 80];

export function percentileCaption(year) {
  const y = bandYear(year);
  const stretched = y <= 2021;
  const sectionNote = stretched
    ? ' Section bands are the 2022 section table, stretched to this year\'s overall 99.'
    : '';
  if (!year) {
    return 'CAT 2025 scaled-score table, the pattern these mocks follow. Not an All-India rank.';
  }
  return `CAT ${y} scaled-score table. A raw slot score stands in for the scaled score.${sectionNote}`;
}
