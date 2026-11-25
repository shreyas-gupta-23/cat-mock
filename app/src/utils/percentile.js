/**
 * Score → percentile from published scaled-score tables, one curve per CAT year.
 * IIMs do not publish an official marks-to-percentile chart. These are the
 * coaching compilations of scaled scores, and a raw slot score is read on that
 * chart.
 *
 * Sections:
 * 2017–2019 DILR: InsideIIM (2017 and 2018 from public scaled scores, 2019 from
 * their scorecard study). 2017 VARC: InsideIIM. 2017 QA 99: GP's published raw
 * score of 78; lower QA marks for 2017 were not published, so the line under 78
 * runs straight to 0.
 * 2018 VARC and QA: Cracku's CAT 2018 score chart.
 * 2019 VARC and QA: Getmyuni's post-result chart.
 * 2020: Cracku ranges quoted by Careers360, using the middle of each range.
 * 2021, 2022, 2024, 2025: iQuanta's September 2026 five-year chart.
 * 2023: Cracku's section chart, as quoted by Careers360.
 *
 * Between two listed marks the percentile moves in a straight line. Above the
 * top listed mark it stays at that percentile. Below the lowest listed mark it
 * falls in a straight line to 0.
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

const SECTION = {
  2017: {
    VARC: [[55, 90], [65, 95], [70, 98], [75, 99]],
    DILR: [[28, 90], [33, 95], [40, 98], [45, 99]],
    Quant: [[78, 99]],
  },
  2018: {
    VARC: [[45, 85], [55, 90], [64, 95], [72, 99]],
    DILR: [[29, 90], [35, 95], [41, 98], [46, 99]],
    Quant: [[26, 85], [30, 90], [35, 95], [55, 99]],
  },
  2019: {
    VARC: [[38, 80], [43, 85], [47, 90], [57, 95], [64, 98], [70, 99]],
    DILR: [[32, 90], [39, 95], [48, 98], [52, 99]],
    Quant: [[24, 80], [28, 85], [34, 90], [43, 95], [52, 98], [67, 99]],
  },
  2020: {
    VARC: [[25.5, 85], [30, 90], [33.5, 95], [42, 99]],
    DILR: [[21.5, 85], [26, 90], [35, 99]],
    Quant: [[27, 85], [33, 90], [37, 95], [43.5, 99]],
  },
  2021: {
    VARC: [[28, 90], [34, 95], [40, 98], [45, 99], [49, 99.5], [56, 99.9]],
    DILR: [[20, 90], [24, 95], [30, 98], [33, 99], [36, 99.5], [42, 99.9]],
    Quant: [[18, 90], [23, 95], [28, 98], [34, 99], [41, 99.5], [49, 99.9]],
  },
  2022: {
    VARC: [[24, 90], [29, 95], [35, 98], [41, 99], [45, 99.5], [52, 99.9]],
    DILR: [[20, 90], [23, 95], [28, 98], [33, 99], [38, 99.5], [46, 99.9]],
    Quant: [[17, 90], [22, 95], [27, 98], [30, 99], [35, 99.5], [43, 99.9]],
  },
  2023: {
    VARC: [[17.58, 85], [22.37, 90], [28.78, 95], [39.83, 99], [44, 99.5], [51.14, 99.9], [58.2, 99.99]],
    DILR: [[11.67, 85], [15.63, 90], [18.92, 95], [27.29, 99], [30.58, 99.5], [36.58, 99.9], [42.66, 99.99]],
    Quant: [[9.2, 85], [13.63, 90], [16.87, 95], [25.2, 99], [28.28, 99.5], [34.96, 99.9], [44.89, 99.99]],
  },
  2024: {
    VARC: [[24, 90], [30, 95], [36, 98], [41, 99], [44, 99.5], [55, 99.9]],
    DILR: [[22, 90], [27, 95], [34, 98], [38, 99], [41, 99.5], [50, 99.9]],
    Quant: [[17, 90], [22, 95], [27, 98], [33, 99], [37, 99.5], [45, 99.9]],
  },
  2025: {
    VARC: [[26, 90], [33, 95], [39, 98], [44, 99], [48, 99.5], [53, 99.9]],
    DILR: [[17, 90], [22, 95], [26, 98], [30, 99], [33, 99.5], [38, 99.9]],
    Quant: [[15, 90], [19, 95], [25, 98], [27, 99], [31, 99.5], [37, 99.9]],
  },
};

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
    const t = Math.max(0, score) / first[0];
    return Math.max(0, Math.min(first[1], t * first[1]));
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
  if (!year) {
    return 'CAT 2025 published scaled-score table, the pattern these mocks follow. Not an All-India rank.';
  }
  return `CAT ${y} published scaled-score table. The raw slot score is read on that table. Between listed marks the percentile moves in a straight line.`;
}
