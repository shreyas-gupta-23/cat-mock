import { eq, sectionHead } from "./chrome.mjs";

export const TOPICS = [
  { slug: "percentages", file: "qa/percentages.html", chip: "Arithmetic", title: "Percentages", blurb: "Successive change, constancy, elections — no fraction-to-% tables." },
  { slug: "ratio", file: "qa/ratio.html", chip: "Arithmetic", title: "Ratio and proportion", blurb: "Chain ratios, partnership, componendo, ages." },
  { slug: "averages", file: "qa/averages.html", chip: "Arithmetic", title: "Averages", blurb: "Weighted, replacement, AM–GM–HM, cricket." },
  { slug: "mixtures", file: "qa/mixtures.html", chip: "Arithmetic", title: "Mixtures", blurb: "Alligation, replacement, three-vessel loops." },
  { slug: "profit-loss", file: "qa/profit-loss.html", chip: "Arithmetic", title: "Profit and loss", blurb: "False weight, successive discount, two-article." },
  { slug: "interest", file: "qa/interest.html", chip: "Arithmetic", title: "SI and CI", blurb: "Effective rate, CI−SI, installments." },
  { slug: "tsd", file: "qa/tsd.html", chip: "Arithmetic", title: "Time, speed, distance", blurb: "Harmonic mean, races, boats, trains, circular." },
  { slug: "time-work", file: "qa/time-work.html", chip: "Arithmetic", title: "Time and work", blurb: "Rates, pipes, alternate days, wages." },
  { slug: "numbers", file: "qa/numbers.html", chip: "Numbers", title: "Number system", blurb: "Remainders, factors, last digits, bases." },
  { slug: "algebra", file: "qa/algebra.html", chip: "Algebra", title: "Algebra", blurb: "Identities, modulus, logs, sequences, max–min." },
  { slug: "geometry", file: "qa/geometry.html", chip: "Geometry", title: "Geometry", blurb: "Similar triangles, circles, 3-D scale, coordinate." },
  { slug: "modern", file: "qa/modern.html", chip: "Modern maths", title: "P&C, probability, sets", blurb: "Counting, Bayes at CAT depth, Venn." },
  { slug: "sets", file: "dilr/sets.html", chip: "DILR", title: "Set selection and LR", blurb: "Scan, abandon, arrangement, binary logic." },
  { slug: "tables", file: "dilr/tables.html", chip: "DILR", title: "Tables and tournaments", blurb: "Missing cells, points, invariants." },
  { slug: "rc", file: "varc/rc.html", chip: "VARC", title: "Reading comprehension", blurb: "Traps only. Then the 2017–2020 RC passages." },
  { slug: "va", file: "varc/va.html", chip: "VARC", title: "Verbal ability", blurb: "Jumbles, summary, odd one out." },
];

export function theory(slug) {
  return THEORIES[slug];
}

const THEORIES = {
  percentages: `
${sectionHead("sheet", "01", "Sheet")}
<p>Skip converting \\(3/8=37.5\\%\\). CAT is change-of-base and chained multipliers.</p>
${eq("(1+\\tfrac{a}{100})(1+\\tfrac{b}{100})(1+\\tfrac{c}{100})-1", "(1+\\tfrac{a}{100})(1+\\tfrac{b}{100})(1+\\tfrac{c}{100})-1")}
<p>Two-step net (signed \\(a,b\\)):</p>
${eq("a+b+\\tfrac{ab}{100}")}
<p>Equal successive \\(x\\%\\) giving net \\(N\\%\\): \\(2x+x^2/100=N\\). Three equal: \\((1+x/100)^3-1=N/100\\).</p>
<p><strong>More / less inversion.</strong> If \\(A\\) is \\(p\\%\\) more than \\(B\\), then \\(B\\) is \\(\\frac{100p}{100+p}\\%\\) less than \\(A\\). If \\(A\\) is \\(p\\%\\) less than \\(B\\), \\(B\\) is \\(\\frac{100p}{100-p}\\%\\) more than \\(A\\).</p>
<p>\\(x\\%\\) of \\(A = y\\%\\) of \\(B\\) \\(\\Rightarrow\\) \\(A:B = y:x\\). “\\(A\\) is \\(p\\%\\) of \\(B\\)” is not “\\(A\\) is \\(p\\%\\) more than \\(B\\)”.</p>
<p><strong>Product constancy</strong> (price \\(\\times\\) consumption = spend). Price \\(+p\\%\\), spend fixed \\(\\Rightarrow\\) consumption \\(-\\frac{100p}{100+p}\\%\\). If one factor \\(+x\\%\\) and the other \\(-x\\%\\), product falls \\((x/10)^2\\%\\).</p>
<p>Numerator \\(+p\\%\\), denominator \\(+q\\%\\): fraction multiplies by \\(\\frac{100+p}{100+q}\\).</p>
<p><strong>Elections.</strong> Valid \\(=\\) polled \\(-\\) invalid. Winner’s votes \\(=\\frac12(\\text{valid}+\\text{margin})\\). Margin as % of valid is not margin as % of polled.</p>
<p><strong>Two tests.</strong> Fail \\(E\\), fail \\(M\\), fail both: inclusion-exclusion. Pass both \\(= 100 - (e+m-b)\\).</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong> Every % question on this page is one of these moves.</p>
<ul>
<li><strong>Remainder chain.</strong> After a filter of \\(p\\%\\), leftover is \\((1-p/100)\\) of the <em>current</em> base. Two filters in sequence: leftover \\(= N(1-a)(1-b)\\). “20% of the rest” is never 20% of the original. Invert from the last leftover: shirts 8840 after 15% defect then 20% of rest domestic \\(\\Rightarrow N=8840/(0.85\\times 0.80)\\).</li>
<li><strong>Product split.</strong> Production \\(=\\) population \\(\\times\\) per capita. Multipliers divide: population factor \\(=\\) production factor / per-capita factor. \\(+40\\%\\) production and \\(+27\\%\\) per capita \\(\\Rightarrow\\) population \\(\\times 1.40/1.27\\).</li>
<li><strong>Falls short of the pass mark by \\(k\\%\\)</strong> means scored \\((1-k/100)\\) of the <em>pass mark</em>, not of \\(N\\). Pass \\(=0.45N\\), scored 36 \\(=0.32\\times 0.45N\\) if 68% short of pass.</li>
<li><strong>Two groups + a count.</strong> \\(g=0.6n\\), \\(b=0.4n\\), \\(g-b=30\\) pins \\(n\\). Then a second % on the same \\(n\\) (who passed) is a new equation, not a new base unless they say so.</li>
<li><strong>Review of a score</strong> is successive % on marks. “Fails by 35” and “7 more than pass after another hike” is two linear equations in (original marks, pass marks).</li>
<li><strong>\\(A\\) is \\(p\\%\\) more than \\(B\\) and \\(q\\%\\) less than \\(C\\).</strong> \\(A=B(1+p/100)=C(1-q/100)\\). Then apply fresh % changes to \\(B\\) and \\(C\\) and compare the new pair.</li>
<li><strong>Two-category growth.</strong> \\(F+N=T_0\\), \\(1.1F+1.12N=T_1\\). Two equations, two stocks. They will ask the later stock, not the earlier, half the time.</li>
<li><strong>Score chain.</strong> Write every person as a multiplier of the last free variable: \\(A=0.9B\\), \\(B=1.25C\\), \\(C=0.8D\\). One given score pins all.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> Successive % sit on different bases. 10% of a 20% increment is 2% of the original, not 30% stacked. Weighted % of two groups is never \\((p_1+p_2)/2\\) unless \\(n_1=n_2\\). “Short by 68%” is not “scored 32% of maximum.”</div>
<div class="take"><strong>Move.</strong> Convert every % into a multiplier on 100 or on a letter, then multiply. Restore the original only at the end. Work backwards from the last leftover.</div>

`,

  ratio: `
${sectionHead("sheet", "01", "Sheet")}
<p>A ratio is a scale. CAT adds one linear constraint that pins the scale, or chains two ratios on a common term.</p>
<p>Chain \\(A:B=a:b\\), \\(B:C=c:d\\): make \\(B\\) common \\(\\mathrm{lcm}(b,c)\\).</p>
${eq("\\frac{a}{b}=\\frac{c}{d}\\iff ad=bc")}
<p><strong>Componendo / dividendo</strong> (and both): \\(\\frac{a}{b}=\\frac{c}{d}\\Rightarrow \\frac{a+b}{a-b}=\\frac{c+d}{c-d}\\) if \\(a\\ne b\\). Invertendo, alternendo as needed when the stem is a nested \\((a+b)/(a-b)\\).</p>
<p><strong>Continued proportion</strong> \\(a,b,c\\): \\(b^2=ac\\). Duplicate ratio of \\(a:b\\) is \\(a^2:b^2\\) (areas); triplicate \\(a^3:b^3\\) (volumes).</p>
<p><strong>Partnership.</strong> Profit \\(\\propto\\) capital \\(\\times\\) time. If times equal, \\(\\propto\\) capital only.</p>
<p><strong>Coins / ages.</strong> Value \\(= 1\\cdot n_1+2\\cdot n_2+5\\cdot n_5+\\cdots\\). Ages: the ratio changes because the <em>difference</em> is invariant (or both increase by the same \\(t\\)).</p>
<p>If \\(kA=mB=nC=\\lambda\\), then \\(A:B:C = \\frac{\\lambda}{k}:\\frac{\\lambda}{m}:\\frac{\\lambda}{n}\\).</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>Integer scale of a chain.</strong> \\(a:b=3:4\\) and \\(b:c=2:1\\) \\(\\Rightarrow\\) make \\(b\\) common: \\(6:8:4\\). Sum is a multiple of 18. Options that are not multiples of the scale are dead.</li>
<li><strong>Transfer.</strong> \\((ak+x):(bk-x)=p:q\\). Cross-multiply; \\(x\\) as a fraction of Lalitha’s original is \\(x/(bk)\\).</li>
<li><strong>Same addend on both.</strong> \\((a+x):(b+x)=p:q\\). Then new/old of one person is \\((b+x)/b\\).</li>
<li><strong>Two-year salary ratios.</strong> 2010 as \\(6k:5k:7k\\), 2015 as \\(3m:4m:3m\\). One known % hike pins \\(m/k\\), then the others’ hikes. The two ratios are <em>not</em> on the same scale.</li>
<li><strong>Capital \\(\\times\\) rate.</strong> Interest \\(\\propto c_i r_i\\). Given one interest difference, the total interest is determined.</li>
<li><strong>Two mix-ratios and two profits</strong> (tea A, B sold at 40): that is P&amp;L plus alligation. CP of the mix \\(=\\mathrm{SP}/(1+\\text{profit})\\). Two mixes give two weighted CPs, then alligation (or two linear equations) for \\(\\mathrm{CP}_A:\\mathrm{CP}_B\\).</li>
<li><strong>Review of three scores.</strong> Old: Rama \\(=\\frac1{12}(M+A)\\). New: each \\(+6\\), and new ratio given. Translate ratio to actuals, subtract 6, feed the first equation.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> Adding a constant to both parts does not preserve the ratio. Mixing two alloys in equal <em>weight</em> vs equal <em>volume</em> are different if densities differ — CAT usually means weight.</div>
<div class="take"><strong>Move.</strong> Write \\(A=ak\\), \\(B=bk\\). Translate every English clause into an equation in \\(k\\) (or two scales, then glue on the overlap).</div>

`,

  averages: `
${sectionHead("sheet", "01", "Sheet")}
${eq("\\bar x = \\frac{\\sum x_i}{n},\\qquad n\\bar x = \\text{total}")}
<p>Join \\(x\\): new \\(=\\frac{nA+x}{n+1}\\). Leave \\(x\\): \\(\\frac{nA-x}{n-1}\\). Replace \\(x\\) by \\(y\\): change in average \\(=\\frac{y-x}{n}\\).</p>
<p><strong>Weighted.</strong> \\(\\frac{n_1A_1+n_2A_2}{n_1+n_2}\\). Alligation if you need the mix ratio given the combined average.</p>
<p><strong>AM–GM–HM</strong> for positives: \\(\\mathrm{AM}\\ge\\mathrm{GM}\\ge\\mathrm{HM}\\), equality iff all equal. Two numbers \\(a,b\\): \\(\\mathrm{AM}=\\frac{a+b}{2}\\), \\(\\mathrm{GM}=\\sqrt{ab}\\), \\(\\mathrm{HM}=\\frac{2ab}{a+b}\\), and \\(\\mathrm{GM}^2=\\mathrm{AM}\\cdot\\mathrm{HM}\\).</p>
<p>Equal distances \\(\\Rightarrow\\) average speed is HM. Equal times \\(\\Rightarrow\\) AM of speeds.</p>
<p>First \\(n\\) naturals: \\(\\frac{n+1}{2}\\). First \\(n\\) odds: \\(n\\). First \\(n\\) evens: \\(n+1\\). Squares: \\(\\frac{(n+1)(2n+1)}{6}\\).</p>
<p>Ages: average of a group \\(+1\\) after one year. A child born: add 0 (or newborn age) and increment \\(n\\).</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>Two leave, their average given as a fraction of the original average.</strong> Original total \\(22A\\). Two who leave average \\(A/3\\), so they take \\(2A/3\\). Remaining 20 have total \\(22A-2A/3\\), and the stem says the average of 22 <em>increases by 2 when they leave</em> — that increase is on the 20: \\(\\frac{22A-2A/3}{20}=A+2\\). One equation in \\(A\\).</li>
<li><strong>First \\(k\\) and last \\(k\\).</strong> Let \\(n\\) tests, overall \\(T\\). Drop first 10: avg \\(+1\\). Drop last 10: avg \\(-1\\). First-10 avg 20, last-10 avg 30. If the two blocks overlap you must write it; if \\(n&gt;20\\) they are disjoint and \\(T=10\\cdot 20 + 10\\cdot 30 + (n-20)\\mu\\). The two “drop” statements pin \\(\\mu\\) and \\(n\\).</li>
<li><strong>Cap a subgroup to maximise its average.</strong> Overall 38, 30 people \\(\\ge 51\\), at most 39 younger. To max the young average, minimise the old total (all 51) and take as many young as the “at most” allows, pushing the constraint until integers break.</li>
<li><strong>Two leave-one-out averages.</strong> Total of 21 other than G, total of 21 other than R, overall. Ramesh’s 82.5 is one known. Translate to totals; Gautam is the unknown.</li>
<li><strong>20 integers \\(\\le 5\\), 30-integer mean 5, max mean of those 20.</strong> The other 10 are \\(&gt;5\\) (or \\(\\ge 6\\) if integers). To max the 20, minimise the 10’s excess over 5. Integers: 10 at 6, then the 20 sum to \\(150-60=90\\), mean 4.5.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> Combined average of 40 and 60 is not 50 unless the counts match. “Average of averages” is a weighted mean with hidden weights.</div>
<div class="take"><strong>Move.</strong> Always restore the total. Cricket “to raise average from \\(a\\) to \\(b\\) in \\(k\\) more innings” is a linear Diophantine on remaining scores with a cap if they mention a highest possible innings.</div>

`,

  mixtures: `
${sectionHead("sheet", "01", "Sheet")}
<p>Alligation (cheap \\(c\\), dear \\(d\\), mean \\(m\\), \\(c&lt;m&lt;d\\)):</p>
${eq("\\frac{q_c}{q_d}=\\frac{d-m}{m-c}")}
<p>Same cross for concentrations, % milk, even for speeds if the stem is a weighted mean in disguise.</p>
<p><strong>Replacement.</strong> Vessel \\(V\\), draw \\(x\\), refill, \\(n\\) times. Fraction of original solute left \\((1-x/V)^n\\). Quantity left \\(V(1-x/V)^n\\) if it started pure. From the second draw you remove mixture, not pure solute — the formula already encodes that.</p>
<p>If you replace with another solution of strength \\(p\\) instead of water, leftover original still \\((1-x/V)^n\\); the added component is a geometric series.</p>
<p>Three vessels: write three linear equations in milk/water. CAT often gives “poured into a fourth empty” — totals add.</p>
<div class="def">
<p><strong>From CAT 2017–2020</strong> (this page also caught some ratio / average stems via 2IIM’s combined tag).</p>
<ul>
<li><strong>Alligation on milk fractions.</strong> Bottle 1 is \\(7/9\\) milk, bottle 2 is \\(9/13\\), target \\(3/4\\). Mix ratio \\(=\\) distances to the target.</li>
<li><strong>Three mixes, then mix those.</strong> Convert each to a water-fraction, weight by 4 : 3 : 2, compare resulting water vs B vs C. Do not alligate three at once.</li>
<li><strong>Replacement twice.</strong> Alcohol left \\(=700\\times(0.9)^2\\) from 875 ml. Water is the complement. Strength \\(p\\%\\) means \\(p\\) grams in 100 ml — treat as a concentration, same algebra.</li>
<li><strong>A \\(\\to\\) B \\(\\to\\) C \\(\\to\\) A transfers.</strong> After each 100 ml move, the source concentration updates before the next draw. Track grams of salt in each vessel, not just %.</li>
<li><strong>Add water to change dye:water from 2:3 to 2:5</strong> (dye fixed). Then remove 1/4 of the new mix (dye and water both drop 25%), then add dye to restore 2:3.</li>
<li><strong>Mix 1:3, then double the volume by adding more of A.</strong> Write two stages. Unknown % of B is one linear equation.</li>
<li><strong>Volume vs weight.</strong> Alloy 3:4:7 <em>by volume</em>, densities 5:2:6. Weight of C in 130 kg is the C-share of \\(\\sum v_i d_i\\).</li>
<li><strong>Density of a blend.</strong> 1 L of liquid 1 is 1 kg, liquid 2 is 0.8 kg; 0.5 L of mix is 0.48 kg \\(\\Rightarrow\\) volume fraction from a weighted density.</li>
<li><strong>Elevator bound.</strong> All between 53 and 57 kg, total \\(\\le 630\\). Max people: assume as light as possible except the stated heaviest must fit — \\(53(n-1)+57\\le 630\\).</li>
<li><strong>Lowest 9 mean 42, highest 9 mean 47, ten students.</strong> Sum of 10 \\(=\\) (sum of lowest 9) + max \\(=\\) (sum of highest 9) + min. Max \\(-\\) min is fixed by those two means; the gap between possible means of the ten is max\\(-\\)min minus the forced overlap.</li>
<li><strong>Cricket:</strong> \\(n+2\\) innings, last two 38 and 15, first \\(n\\) average 30, each \\(&lt;38\\), minimise the lowest. Total of first \\(n\\) is \\(30n\\); to min \\(x\\), dump as much as possible into the other \\(n-1\\) without hitting 38.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> “8 L replaced twice from 40 L” is not “16 L milk gone.” Milk gone is \\(40-40(0.8)^2=14.4\\).</div>
<div class="take"><strong>Move.</strong> Track one component (usually milk or acid). Water is the complement if the vessel stays full.</div>

`,

  "profit-loss": `
${sectionHead("sheet", "01", "Sheet")}
${eq("\\mathrm{SP}=\\mathrm{CP}\\bigl(1\\pm \\tfrac{p}{100}\\bigr),\\qquad \\mathrm{discount}=\\tfrac{\\mathrm{MP}-\\mathrm{SP}}{\\mathrm{MP}}")}
<p>Markup \\(m\\%\\), discount \\(d\\%\\): profit % \\(= m-d-md/100\\).</p>
<p>Successive discounts \\(d_1,d_2\\): net off \\(= d_1+d_2-d_1d_2/100\\). Never add.</p>
<p><strong>False weight.</strong> Claims to sell at CP (or at \\(r\\%\\) profit) but uses \\(w\\) g as 1000 g:</p>
${eq("\\text{true profit %}=\\frac{1000(1+r/100)-w}{w}\\times 100")}
<p>If \\(r=0\\): \\((1000-w)/w \\times 100\\).</p>
<p><strong>Two articles.</strong> Same CP, \\(+x\\%\\) and \\(-x\\%\\): net 0. Same SP, \\(+x\\%\\) and \\(-x\\%\\): net loss \\(x^2/100\\%\\) of CP (product constancy on CP). Sold two at same SP, one profit \\(p\\%\\) one loss \\(p\\%\\): loss \\(= (p/10)^2\\%\\) on total CP.</p>
<p>Buy \\(n\\) get \\(k\\) free, marked at \\(m\\%\\) above CP: effective discount \\(=\\frac{k}{n+k}\\times 100\\%\\) on MP, then chain with markup.</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>Retail / discount / profit together.</strong> \\(\\mathrm{SP}=\\mathrm{RP}(1-d)=\\mathrm{CP}(1+p)\\). “15% off RP still 2% profit; want 20% profit” \\(\\Rightarrow\\) sell at RP (compute: \\(0.85\\,\\mathrm{RP}=1.02\\,\\mathrm{CP}\\) so \\(\\mathrm{RP}=1.2\\,\\mathrm{CP}\\)).</li>
<li><strong>Common SP of two qualities.</strong> Good mangoes \\(2x\\)/kg, medium \\(x\\). Buy 80 kg good + 40 kg medium, sell all at \\(0.9\\times 2x\\). Profit on mixed CP.</li>
<li><strong>Destroyed stock, same profit amount.</strong> 60 toys at 40% off MP give 20% on CP. 10 burn. New discount on 50 so that profit <em>rupees</em> match, not the %.</li>
<li><strong>Chain of dealers.</strong> Customer pays \\(\\mathrm{CP}\\times 1.1\\times 1.3\\times 1.5\\).</li>
<li><strong>Two goods, two selling regimes.</strong> Pen at \\(-5\\%\\) and book at \\(+15\\%\\) net +7; pen \\(+5\\%\\) and book \\(+10\\%\\) net +13. Two linear equations in the two CPs.</li>
<li><strong>\\(n\\) at \\(+p\\%\\), \\(m\\) at \\(-p\\%\\), net profit in rupees.</strong> Not the \\((p/10)^2\\) identity unless SP is the same. Here CPs are equal: net \\(= p\\%(n-m)\\times\\mathrm{CP}\\).</li>
<li><strong>Chained then compared.</strong> Two tables, same CP \\(p\\): +20% then +30% vs −20% then −30%. \\((x-y)/p = 1.2\\times 1.3 - 0.8\\times 0.7\\).</li>
<li><strong>Alligation on overall profit.</strong> Desktop +20%, laptop −10%, overall +2% on 50000. Mix ratio of the two CPs is alligation on +20 and −10 toward +2.</li>
<li><strong>Discount then extra 25% off the already-discounted price</strong> is successive, not 45% off. Back out labelled price from total SP and the 10% profit, then profit if no discount at all.</li>
<li><strong>Wasted weight + raise MP by \\(p\\%\\)</strong> to hit a target overall profit: write rupees in and rupees out, one unknown \\(p\\).</li>
<li><strong>Also on this page:</strong> ages as % (Arun 40% of Barun, later 50% — difference invariant); nested savings 50% FD, 30% of rest stocks; admission % of girls vs boys; two commodities whose prices rise 20% and 12%; exam % of three people plus a fourth 84% of the same \\(N\\); 28% young, 65% literate, 25% of literates young — two-way table, % old among illiterate.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> Profit on SP is not profit on CP. “Cost price of 12 = selling price of 10” \\(\\Rightarrow\\) profit \\(20\\%\\) on CP, not \\(16.\\overline{6}\\%\\) unless they asked on SP.</div>
<div class="take"><strong>Move.</strong> CP \\(=100\\) unless two goods force two CPs. False weight: money in vs true quantity out.</div>

`,

  interest: `
${sectionHead("sheet", "01", "Sheet")}
${eq("\\mathrm{SI}=\\frac{Prt}{100},\\qquad A_{\\mathrm{CI}}=P\\Bigl(1+\\tfrac{r}{100k}\\Bigr)^{kt}")}
<p>\\(k=1\\) yearly, \\(2\\) half-yearly, \\(4\\) quarterly. Effective annual rate for half-yearly \\(r\\%\\): \\(r+\\frac{r^2}{400}\\).</p>
<p>Two-year CI−SI at \\(r\\%\\): \\(P(r/100)^2\\). Three-year CI−SI: \\(P\\bigl((r/100)^3 + 3(r/100)^2\\bigr)\\).</p>
<p>Amount in 3 years / amount in 2 years at CI \\(= 1+r/100\\) (same \\(P\\)). Difference of CI for consecutive years is itself a CI on last year’s interest.</p>
<p><strong>Installments.</strong> Present value of an annuity of \\(A\\) per year for \\(n\\) years at \\(r\\%\\) CI: \\(A\\bigl(1-(1+r/100)^{-n}\\bigr)/(r/100)\\). CAT usually \\(n=2\\) or \\(3\\): \\(P = \\frac{A}{1+r/100}+\\frac{A}{(1+r/100)^2}+\\cdots\\).</p>
<p>Population / depreciation use the CI multiplier (growth signed).</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>Two equal CI instalments.</strong> Loan \\(P\\), rate \\(r\\), two years: \\(P=\\frac{A}{1+r}+\\frac{A}{(1+r)^2}\\). First instalment is interest of year 1 plus some principal; the formula already encodes that.</li>
<li><strong>On-lending.</strong> Borrow \\(X\\) at 8%, add \\(Y\\), lend \\(X+Y\\) at 10%. Net kept \\(=\\) Ankit’s interest on \\(X\\) gives one equation; the “\\(X+2Y\\)” variant gives the second.</li>
<li><strong>Split SI at three rates.</strong> 15 lakh: some at 6%, rest 2:1 at 4% and 3%. One linear equation for the 6% slice.</li>
<li><strong>CI annual + CI semi-annual vs SI.</strong> Amal: \\(12000\\times 0.08\\) plus \\(10000\\bigl((1.03)^2-1\\bigr)\\). Bimal: \\(P\\times 0.075\\). Equal interest pins \\(P\\).</li>
<li><strong>Two SI clocks, staggered start.</strong> Veeru 10000 at 5% from \\(t=0\\); Joy 8000 at 10% from \\(t=2\\). Set amounts equal: \\(10000(1+0.05t)=8000(1+0.10(t-2))\\).</li>
<li><strong>CI of 2 years at 5% minus SI of 3 years at 3%.</strong> \\(P\\bigl((1.05)^2-1 - 0.09\\bigr)=1125\\).</li>
<li><strong>Half-yearly for 1.5 years</strong> is three applications of \\(r/2\\): \\(P(1.05)^3=18522\\).</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> “\\(r\\%\\) per annum compounded quarterly for 9 months” is three applications of \\(r/4\\), not \\(3r/4\\) simple. SI and CI coincide for one compounding period.</div>
<div class="take"><strong>Move.</strong> For 2 years, prefer CI−SI \\(=P(r/100)^2\\) over expanding binomials. For fractional years mixed SI/CI, split the last fraction as SI on the last CI amount if the problem says so — read the stem.</div>

`,

  tsd: `
${sectionHead("sheet", "01", "Sheet")}
${eq("d=vt,\\qquad 1\\,\\mathrm{km/h}=\\tfrac{5}{18}\\,\\mathrm{m/s},\\qquad 1\\,\\mathrm{m/s}=\\tfrac{18}{5}\\,\\mathrm{km/h}")}
<p>Relative: same direction \\(|v_1-v_2|\\), opposite \\(v_1+v_2\\). Trains: crossing each other, add lengths; pole/man, one length; platform, train+platform.</p>
<p>Equal distances: \\(\\bar v = \\mathrm{HM}=2ab/(a+b)\\). Equal times: AM. \\(n\\) equal stretches at \\(v_i\\): \\(\\bar v = n/\\sum(1/v_i)\\).</p>
<p>Upstream \\(b-s\\), downstream \\(b+s\\). Then \\(b=\\frac{d+u}{2}\\), \\(s=\\frac{d-u}{2}\\). Still-water time vs stream: extra time is not \\(s\\) itself.</p>
<p><strong>Races.</strong> When A finishes \\(D\\), B has run \\(D-g\\) if A beats B by \\(g\\) metres. Time same. Ratio of speeds \\(= D:(D-g)\\). “Beats by \\(t\\) seconds”: convert to metres via B’s speed.</p>
<p>To meet: together they close the initial gap at relative speed. Opposite start, distance \\(D\\), meet after \\(D/(v_1+v_2)\\). From the same point and back, first meet at lcm of times or use relative.</p>
<p>Escalator / walkator: steps visible \\(= (v_{\\mathrm{you}}+v_{\\mathrm{esc}})t\\) in steps; two people give two equations in step-size.</p>
<p>Circular track length \\(L\\): time between meetings \\(L/|v_1\\pm v_2|\\) (opposite vs same). First meeting at \\(\\frac{v_1}{v_1+v_2}L\\) from A’s start if they start together opposite.</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>Late / early by the same clock.</strong> Walk 12 vs 15 km/h, 10 min late vs 10 min early: \\(\\frac{d}{12}-\\frac{d}{15}=\\frac13\\) hour. Scheduled time is the midpoint of the two arrival times.</li>
<li><strong>Two speeds, unknown scheduled time, asked a third speed.</strong> \\(d/8\\) and \\(d/15\\) give two arrival clocks; the 9:10\\(\\to\\)10:00 slot is 50 min, so \\(v=d/(5/6)\\).</li>
<li><strong>After they meet, times \\(t_1,t_2\\) to finish.</strong> \\(\\dfrac{v_1}{v_2}=\\sqrt{\\dfrac{t_2}{t_1}}\\). (Car 1 takes 45 min after meeting, car 2 takes 20 \\(\\Rightarrow\\) \\(v_2=v_1\\sqrt{45/20}\\).) Same formula when remaining times are 1 min and 4 min: speed ratio \\(2:1\\).</li>
<li><strong>Same direction vs opposite, same pair.</strong> Towards each other meet in 1 h, both east meet in 7 h: \\(v_1+v_2=350\\), \\(|v_1-v_2|=350/7\\).</li>
<li><strong>Races, two at a time.</strong> A beats B by 1 km in 10 km \\(\\Rightarrow\\) when A runs 10, B runs 9. A beats C: compose the ratios. Three-horse: first beats second by 11 m and third by 90 m; second beats third by 80 m — let length \\(D\\), speeds \\(D:D-11:D-90\\) from the first sentence, then the second sentence is a consistency check that pins \\(D\\).</li>
<li><strong>Car A beats B by 45, B beats C by 50, A beats C by 90.</strong> When A finishes \\(D\\), B has \\(D-45\\), C has \\(D-90\\). The B-vs-C statement is when B finishes \\(D\\), C has \\(D-50\\). Compose: \\((D-45)/D \\times (D-50)/D = (D-90)/D\\).</li>
<li><strong>Wheels.</strong> Distance \\(=2\\pi r \\times\\) revolutions. \\(N_A=N_B+5000\\), same distance, radii 30 and 40.</li>
<li><strong>Equal-time vs equal-distance on three speeds.</strong> Amal 1/3 of time each; Bimal 1/3 of distance each. Amal’s avg is AM of speeds; Bimal’s is HM. Then % extra time.</li>
<li><strong>Train crossing two walkers, same direction.</strong> \\(L/(V-2)\\) in 90 s, \\(L/(V-4)\\) in 100 s. Post time is \\(L/V\\).</li>
<li><strong>1/3 usual speed \\(\\Rightarrow\\) 30 min late</strong> pins usual time: usual \\(t\\), slow \\(3t=t+1/2\\) so \\(t=15\\) min. Then the return with a 4 min stop is a new speed on leftover distance.</li>
<li><strong>Opposite on a circle.</strong> First meet when A has done 60% \\(\\Rightarrow\\) speed ratio 3:2. If A is back at P at 10:12 and the 10:00 meeting was not at P, A’s remaining 40% took 12 min, so A’s full period is 30 min. B’s remaining 40% of the track at that meeting gives B’s period the same way.</li>
<li><strong>Two tangent circles, walkers on each.</strong> Periods \\(T=2\\pi r/v\\). First reunion at A is LCM of the two periods (full rounds).</li>
<li><strong>Three on one circle.</strong> Anil and Sunil meet at start when both have run integer laps: LCM of their lap times. Ravi’s distance in that time is \\(v_R\\times t\\).</li>
<li><strong>Motorcycles every minute.</strong> Cyclist A\\(\\to\\)B in 60 min; 45 bikes reach B by 11. Doubling cyclist speed halves his time; count bikes whose travel-plus-start fits.</li>
<li><strong>Bypass / half-way slow then extra 5 miles.</strong> Split the return into two segments; onward is one segment. One equation in the unknown half-distance.</li>
<li><strong>Boat, double still-water speed, total time down 75%.</strong> Down+up times: \\(\\frac{d}{b+s}+\\frac{d}{b-s}\\) vs \\(\\frac{d}{2b+s}+\\frac{d}{2b-s}=\\frac14\\) of original. Ratio \\(b:s\\).</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> Average of 40 and 60 on a to-and-fro is 48, not 50. Rest time is not motion. Headwind/tailwind is boat-stream in disguise.</div>
<div class="take"><strong>Move.</strong> Convert units once. Draw a line with marks. Races: freeze the winner at the tape and read the loser’s position.</div>

`,

  "time-work": `
${sectionHead("sheet", "01", "Sheet")}
<p>Rate of A in \\(a\\) days: \\(1/a\\) job per day. LCM-of-days as total units is the same model with integers.</p>
${eq("\\frac{1}{T}=\\frac{1}{a}+\\frac{1}{b}-\\frac{1}{c}\\quad(\\text{c a leak})")}
<p>Efficiency ratio \\(e_A:e_B\\) \\(\\Rightarrow\\) time ratio \\(e_B:e_A\\). “\\(A\\) is \\(p\\%\\) more efficient than \\(B\\)” \\(\\Rightarrow\\) rates \\(100+p:100\\), not times \\(100+p:100\\).</p>
<p>Alternate days: work in a 2-day cycle, leftover &lt; one cycle handled separately. If they start with A, the last partial day may be A’s or B’s — check leftover against one person’s rate.</p>
<p>Pipes: inlet \\(+\\), outlet \\(-\\). A cistern fills in \\(a\\), empties in \\(b\\): net \\(1/a-1/b\\). Overflow after a tap is closed: split the timeline.</p>
<p>Men-women-children: convert to one unit (man-days). \\(m_1\\times d_1\\times h_1 / w_1 = m_2\\times d_2\\times h_2 / w_2\\) if efficiency is uniform.</p>
<p>Wages \\(\\propto\\) work done (rate \\(\\times\\) time actually worked), not \\(\\propto\\) days present if rates differ.</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>One new equal worker every day.</strong> Day \\(k\\) has \\(k\\) people of rate \\(1/120\\). Work after \\(n\\) days: \\(\\frac{1}{120}\\cdot\\frac{n(n+1)}{2}=1\\) \\(\\Rightarrow n(n+1)=240\\), \\(n=15\\).</li>
<li><strong>Inlet 8 h, inlet+outlet 10 h.</strong> Outlet rate \\(=1/8-1/10=1/40\\) tank/h. Full to half-full with only outlet: 20 h.</li>
<li><strong>Humans and robots, two mixes.</strong> \\(15h+5r=1/30\\), \\(5h+15r=1/60\\). Linear. Then 15 humans alone.</li>
<li><strong>Fill pipes vs drain pipes, two scenarios.</strong> \\(6f-5d=1/6\\), \\(5f-6d=1/60\\). Then \\(2f-d\\).</li>
<li><strong>Two types of inlet.</strong> Same idea, both positive: \\(10A+45B=1/30\\), \\(8A+18B=1/60\\) (per minute).</li>
<li><strong>Clock: tank emptied at a fixed time, then A and/or B fill.</strong> Monday A done at 8 pm, Tuesday B at 6 pm, Wednesday A till 5 then B to 7. The empty-time is the unknown start \\(T\\). Three equations in \\(T, a, b\\) as hours of work. Thursday both: time \\(T + 1/(1/a+1/b)\\).</li>
<li><strong>Efficiency drop after day 7.</strong> Together 16 days usually. After 7, Ramesh at 70%. They finish on day 17. Remaining after 7 is 9/16; the extra day is because of the 30% cut. Ganesh-alone on that remaining is leftover / Ganesh’s rate.</li>
<li><strong>Half job A, then 4 days together, then B finishes the last 5%.</strong> B is 25% slower than A. Let A’s days be \\(a\\), B’s \\(1.25a\\). The 5% leftover pins \\(a\\).</li>
<li><strong>A half as efficient, B triple, 9 days vs usual 12 together.</strong> \\(A+B=1/12\\), \\(A/2+3B=1/9\\).</li>
<li><strong>Men vs machines.</strong> \\(3m+8M\\) takes half the time of \\(8m+3M\\) \\(\\Rightarrow\\) rate ratio 2:1. Two machines in 13 days \\(\\Rightarrow\\) one machine’s rate, then how many men match that in 13 days.</li>
<li><strong>Third person does 10% of the job.</strong> Anil 3 days, then Sunil joins, then Bimal. Work remaining after Anil’s 3 is 17/20. Bimal’s 10% is 0.1 of the whole job, not of the leftover.</li>
<li><strong>MDH leftover.</strong> 6 km in 200 days, 140 people, 1.5 km in 60 days. Remaining 4.5 km in 140 days. People needed \\(=\\) (140 \\(\\times\\) 60 / 1.5) \\(\\times\\) 4.5 / 140, then extra \\(=\\) that minus 140.</li>
<li><strong>Overtime at 2\\(\\times\\) wage, 15% of regular income.</strong> \\(114\\,o = 0.15\\times 57\\,r\\) and \\(r+o=172\\).</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> “Together they would have finished in 10, but B leaves after 4” — do not assign 4 days of combined rate to both remaining. Compute work done, then leftover / leftover person’s rate.</div>
<div class="take"><strong>Move.</strong> Units of work first. Then who is on stage in each interval.</div>

`,

  numbers: `
${sectionHead("sheet", "01", "Sheet")}
<p>\\(n=dq+r\\), \\(0\\le r&lt;d\\). \\(a\\equiv b\\pmod m\\Rightarrow m\\mid(a-b)\\). Linear \\(ax\\equiv b\\pmod m\\) solvable iff \\(\\gcd(a,m)\\mid b\\), then that many solutions.</p>
<p>CRT: pairwise coprime moduli, unique class modulo the product.</p>
${eq("\\mathrm{lcm}(a,b)\\cdot\\gcd(a,b)=ab\\quad(a,b&gt;0)")}
<p>\\(n=\\prod p_i^{a_i}\\): divisors \\((a_1+1)(a_2+1)\\cdots\\). Sum of divisors \\(\\prod\\frac{p^{a+1}-1}{p-1}\\). Odd divisors: ignore \\(2^{a}\\). Square \\(\\iff\\) all \\(a_i\\) even. Cube \\(\\iff\\) all \\(a_i\\) multiples of 3.</p>
<p>Last digit: cycles. \\(2,3,7,8\\): 4. \\(4,9\\): 2. \\(0,1,5,6\\): 1. Last two digits: mod 100. Euler \\(\\varphi(100)=40\\) for coprime bases.</p>
<p>Trailing zeros of \\(n!\\): \\(\\sum_{k\\ge 1}\\lfloor n/5^k\\rfloor\\). Highest power of \\(p\\) in \\(n!\\): \\(\\sum \\lfloor n/p^k\\rfloor\\).</p>
<p>Remainders of \\(a^n\\): binomial \\((1+m)^n\\) or Euler/Fermat. \\(7^{n}\\bmod 4 = (-1)^n\\bmod 4\\).</p>
<p>HCF of \\(a,b\\) = HCF\\((a,b-ka)\\). HCF of \\(n,n+k\\) divides \\(k\\). For \\(f(n)=an+b\\), HCF of consecutive values often divides a constant.</p>
<p>Base \\(b\\): \\((d_k\\cdots d_0)_b = \\sum d_i b^i\\), each \\(d_i&lt;b\\).</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>Egyptian fraction.</strong> \\(\\frac1a+\\frac1b=\\frac19\\), \\(a\\le b\\): \\(b=\\frac{9a}{a-9}\\), so \\(a-9\\) divides 81. Count positive divisors.</li>
<li><strong>Difference of squares.</strong> \\(n^2-m^2=105=(n-m)(n+m)\\). Factor pairs of 105 of the same parity, both positive, \\(n+m&gt;n-m\\).</li>
<li><strong>\\(ab=4^{2017}\\) with \\(a\\le b\\).</strong> Number of factor pairs is \\(\\lceil(e+1)/2\\rceil\\) where \\(e=4034\\) is the exponent of 2, i.e. 2018.</li>
<li><strong>Perfect-square factors of \\(2^4 3^5 10^4=2^8 3^5 5^4\\)</strong> greater than 1: even exponents up to the max, minus the \\(2^0 3^0 5^0\\) case.</li>
<li><strong>Three consecutive product 15600.</strong> Near cube root 25; check 24·25·26.</li>
<li><strong>\\((a-b)^2\\) identity / sum of squares.</strong> \\(a^2+b^2=97\\), product \\(p\\): \\((a+b)^2=97+2p\\ge 0\\), \\((a-b)^2=97-2p\\ge 0\\) so \\(|p|\\le 48.5\\). 64 is impossible.</li>
<li><strong>\\((a^3-b^3)/(a-b)^3=157/3\\), \\(ab=616\\).</strong> \\(\\frac{a^2+ab+b^2}{(a-b)^2}=\\frac{157}{3}\\), and \\(a^2+2ab+b^2=(a+b)^2\\), \\(a^2+b^2=(a+b)^2-2ab\\).</li>
<li><strong>Dot product max.</strong> \\(a^2+b^2=25\\), \\(x^2+y^2=169\\), \\(ax+by=65=5\\cdot 13\\) \\(\\Rightarrow\\) the two vectors are parallel, so \\(ay-bx=0\\).</li>
<li><strong>Ascending-digit numbers from 1–9, no repeat:</strong> each non-empty subset of size \\(\\ge 2\\) is one number. \\(2^9-1-9=502\\).</li>
<li><strong>Digit product in \\((2,7)\\):</strong> 3-digit, product 3,4,5,6. Casework on factorisations into three digits 1–9.</li>
<li><strong>7 before 3 in a 4-digit with distinct digits.</strong> Among positions of 7 and 3, half the equally likely orders have 7 first (careful with 0). Count total distinct 4-digit with both 7 and 3, divide by 2, plus numbers with 7 and not 3, etc. — or: pick 4 distinct, if both 7 and 3 present then 2 of 2! orders on those two seats work.</li>
<li><strong>Form \\(aabb\\) even.</strong> \\(1100a+11b=11(100a+b)\\), \\(b\\) even, \\(a=1..9\\). Mean of that list.</li>
<li><strong>Two-digit \\(10x+y&gt;3(10y+x)\\), \\(y\\ne 0\\).</strong> \\(7x&gt;29y\\), small loop on \\(y\\).</li>
<li><strong>Pigeonhole birthdays.</strong> 100 people, 12 months, minimise the maximum month: \\(\\lceil 100/12\\rceil=9\\).</li>
<li><strong>Inclusion-exclusion.</strong> How many of 1..120 divisible by none of 2, 5, 7.</li>
<li><strong>AM–GM in disguise.</strong> \\(x+y=102\\), minimise \\((1+1/x)(1+1/y)=1+103/(xy)\\). Minimum when \\(xy\\) is maximum, i.e. \\(x=y=51\\).</li>
<li><strong>Magic square 1–9.</strong> Line sum 15. Corners 6 and 2 given; centre is 5; bottom middle follows.</li>
<li><strong>Wrong factor 73 vs 37, product up 720.</strong> Other two numbers multiply to \\(720/(73-37)=20\\). Min \\(p^2+q^2\\) given \\(pq=20\\): 2 and 10 \\(\\to 4+100=104\\)? Reals: min when \\(p=q=\\sqrt{20}\\), sum of squares 40. Stem says three real numbers, so 40.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> Remainder when \\(2n\\) is divided by 5 is not twice the remainder of \\(n\\) unless you reduce mod 5. Number of even factors is not “half the factors” if \\(n\\) is odd (then zero) or if \\(n=2^k\\times\\text{odd}\\).</div>
<div class="take"><strong>Move.</strong> Factor first. For remainders, rewrite the dividend as a nearby multiple plus a small integer, or factor \\(a^n-1\\).</div>

`,

  algebra: `
${sectionHead("sheet", "01", "Sheet")}
${eq("\\sum\\alpha=-\\tfrac{b}{a},\\;\\prod\\alpha=\\tfrac{c}{a}\\quad\\text{for }ax^2+bx+c=0")}
<p>\\(D=b^2-4ac\\). Vertex at \\(x=-b/(2a)\\). For \\(x+1/x=k\\), \\(x^2+1/x^2=k^2-2\\), \\(x^3+1/x^3=k^3-3k\\). If \\(a+b+c=0\\) then \\(a^3+b^3+c^3=3abc\\).</p>
${eq("a^3\\pm b^3=(a\\pm b)(a^2\\mp ab+b^2),\\quad (a+b+c)^2=\\sum a^2+2\\sum ab")}
<p>AM–GM: \\(\\frac{x_1+\\cdots+x_n}{n}\\ge\\sqrt[n]{x_1\\cdots x_n}\\). Weighted AM–GM. For \\(x&gt;0\\), \\(x+\\frac{k}{x}\\ge 2\\sqrt{k}\\).</p>
<p>\\(|x-a|&lt;b\\iff a-b&lt;x&lt;a+b\\). \\(|x-a|&gt;b\\iff x&lt;a-b\\) or \\(x&gt;a+b\\). Squaring inequalities: both sides non-negative, or split.</p>
<p>\\(f\\circ g\\): inner first. Inverse iff injective on the stated domain. \\(f(x)=|x-a|+|x-b|\\) minimises on \\([a,b]\\) (the interval between).</p>
<p>Logs (CAT): \\(\\log_b a = \\frac{\\log_k a}{\\log_k b}\\), \\(\\log_b a\\cdot\\log_a b=1\\), \\(\\log_b a^c=c\\log_b a\\), change of base. Domain \\(a&gt;0,a\\ne 1\\) for the base; argument \\(&gt;0\\).</p>
<p>AP: \\(T_n=a+(n-1)d\\), \\(S_n=\\frac{n}{2}[2a+(n-1)d]\\). GP: \\(T_n=ar^{n-1}\\), \\(S_n=a\\frac{r^n-1}{r-1}\\). Special: \\(1+r+r^2+\\cdots=\\frac{1}{1-r}\\) for \\(|r|&lt;1\\) (rare in CAT; finite GP is the default).</p>
<p>Integer roots: rational root theorem. Max/min of quadratic on integers: evaluate near the vertex.</p>
<div class="def">
<p><strong>From CAT 2017–2020 — algebra toolkit the papers actually used.</strong></p>
<ul>
<li><strong>Logs.</strong> \\(\\log_b a=1/\\log_a b=\\log a/\\log b\\). \\(\\log_b a\\cdot\\log_c b\\cdot\\log_a c=1\\). If \\(\\log_3 x=\\log_{12} y=a\\) then \\(x=3^a\\), \\(y=12^a\\), GM \\(=\\sqrt{xy}=6^a\\), so \\(\\log_6 G=a\\). Nested: \\(\\log_2(5+\\log_3 a)=3\\) unwraps inside-out. \\(1/\\log_k 100=\\log_{100} k\\), so a long alternating chain is \\(\\log_{100}\\) of a product/quotient of the bases.</li>
<li><strong>Change to one base when \\(p^3=q^4=r^5=s^6=k\\).</strong> \\(p=k^{1/3}\\) etc. Then \\(\\log_s(pqr)=\\frac13/\\frac16+\\frac14/\\frac16+\\frac15/\\frac16\\).</li>
<li><strong>Exponents to a common base.</strong> \\(9^{2x-1}-81^{x-1}=1944\\) is \\(3^{4x-2}-3^{4x-4}\\). \\(2^{6x}+2^{3x+2}-21=0\\) is quadratic in \\(2^{3x}\\). \\(a^{m}=b^{n}=c^{p}\\) take logs, or write all as \\(k\\).</li>
<li><strong>\\(x+1/x=k\\) substitution</strong> on \\((x+1/x)^2-3(x+1/x)+2=0\\). Then solve \\(x+1/x=1\\) or 2 and discard \\(x=0\\).</li>
<li><strong>\\(f(ab)=f(a)f(b)\\) on positives.</strong> Completely multiplicative. \\(f(1)=f(1)^2\\Rightarrow f(1)\\in\\{0,1\\}\\); largest is 1. If \\(f(1),f(2),f(3)\\) positive integers, \\(f(24)=54=2\\cdot 3^3\\) pins the primes: \\(f(2)^3 f(3)=54\\), with \\(f(1)&lt;f(2)\\).</li>
<li><strong>Even about a point.</strong> \\(f(5+x)=f(5-x)\\) \\(\\Rightarrow\\) roots symmetric about 5. Four distinct roots: they pair as \\(5\\pm a\\), \\(5\\pm b\\), sum \\(20\\).</li>
<li><strong>min / max of two graphs.</strong> \\(f=\\min\\{2x^2, 52-5x\\}\\): max of \\(f\\) is at the intersection of the two, in the positive reals. \\(f=\\max\\{5x, 52-2x^2\\}\\): min of \\(f\\) is at their intersection.</li>
<li><strong>\\(|f+g|=|f|+|g|\\)</strong> iff \\(fg\\ge 0\\). For \\(f=2x-5\\), \\(g=7-2x\\), that is \\(x\\) between the two roots.</li>
<li><strong>Quadratic always positive:</strong> \\(a&gt;0\\) and \\(D&lt;0\\) (or \\(D=0\\) if \\(\\ge\\)). Two such, maximise a linear in the coefficients.</li>
<li><strong>\\(|x^2-x-6|=x+2\\)</strong> split on the kinks of the abs. Distinct roots, then product.</li>
<li><strong>\\((p(x))^{q(x)}=1\\)</strong> cases: base 1; base \\(-1\\) and even exponent; exponent 0 with base \\(\\ne 0\\). For a product of two integer-valued quadratics equal to 1, the integer pairs are \\((1,1)\\) and \\((-1,-1)\\) (each quadratic ranging in a small set).</li>
<li><strong>AP.</strong> \\(T_7^2=T_3 T_{17}\\) with \\(d&gt;0\\) pins \\(a:d\\). Partial sum of first \\(n\\) vs first \\(3n\\). Telescoping \\(\\frac1{(3k-1)(3k+2)}=\\frac13\\bigl(\\frac1{3k-1}-\\frac1{3k+2}\\bigr)\\). Common terms of two APs: AP with difference lcm, first common term, last \\(\\le\\) both ends.</li>
<li><strong>GP infinite:</strong> \\(a_n=3(a_{n+1}+a_{n+2}+\\cdots)=3\\cdot a_{n+1}/(1-r)\\). Plus sum 32 pins \\(a,r\\).</li>
<li><strong>GP in \\(x,y,z\\), and 5x, 16y, 12z in AP:</strong> \\(y^2=xz\\), \\(32y=5x+12z\\). Let \\(y=xr\\), \\(z=xr^2\\).</li>
<li><strong>Recurrence \\(x_{m}=x_{m+1}+(m+1)\\)</strong> with \\(x_1=-1\\) is a backward sum: \\(x_{100}=-1-\\sum_{k=2}^{100}k\\).</li>
<li><strong>Fibonacci-like \\(f(x+2)=f(x)+f(x+1)\\).</strong> Work backwards from two given terms; the linear recurrence runs both ways.</li>
<li><strong>Linear Diophantine.</strong> \\(2x+5y=99\\), \\(x\\ge y\\ge -20\\). Particular solution, then the general step (\\(+5,-2\\)), count lattice points in the band.</li>
<li><strong>Unique solution of two linears</strong> iff determinant \\(k^2-4\\ne 0\\), i.e. \\(|k|\\ne 2\\).</li>
<li><strong>Toffees: each child gets half the remaining plus one, five children empty the stock.</strong> Work backwards: before the last child there was 1 (because \\(\\frac12 s+1=s\\Rightarrow s=2\\)? Last child takes all: remaining after 4 is 2 if the rule is “half plus one empties”). Standard: if after taking half plus one nothing is left, remaining going in was 2. Unfold five times.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> \\(x^2&gt;9\\Rightarrow x&gt;3\\) is false. \\(\\log(ab)=\\log a+\\log b\\) needs \\(a,b&gt;0\\). Cancelling \\((x-1)\\) loses the root \\(x=1\\). \\(a^0=1\\) fails at \\(a=0\\).</div>
<div class="take"><strong>Move.</strong> Factor or substitute (\\(t=x+1/x\\), \\(t=\\sqrt{x}\\), \\(t=2^{3x}\\)). If it looks messy, an identity is sitting there.</div>

`,

  geometry: `
${sectionHead("sheet", "01", "Sheet")}
<p>Similar triangles: AA. Sides proportional; areas square of the scale. Midline of a triangle is parallel to the third side and half as long. Median splits area equally; centroid divides each median \\(2:1\\).</p>
<p>Right triangle: Pythagoras. \\(30^\circ\\)-\\(60^\circ\\)-\\(90^\circ\\) \\(=1:\\sqrt{3}:2\\). \\(45^\circ\\)-\\(45^\circ\\)-\\(90^\circ\\) \\(=1:1:\\sqrt{2}\\). Area \\(\\frac12 ab\\sin C = \\sqrt{s(s-a)(s-b)(s-c)}\\).</p>
<p>Circle: angle in a semicircle \\(90^\circ\\). Centre angle \\(=2\\times\\) circumference angle on the same arc. Tangent \\(\\perp\\) radius; two tangents from an external point equal. Chord \\(=2\\sqrt{r^2-d^2}\\). Power of a point: \\(PA\\cdot PB=PC\\cdot PD=\\mathrm{tangent}^2\\).</p>
<p>Cyclic quadrilateral: opposite angles sum \\(180^\circ\\). Ptolemy if needed: \\(AC\\cdot BD=AB\\cdot CD+AD\\cdot BC\\).</p>
<p>Coordinate: distance, midpoint, slope; perpendicular \\(m_1m_2=-1\\). Section formula: point dividing \\(A,B\\) in \\(m:n\\) is \\(\\bigl(\\frac{nx_1+mx_2}{m+n},\\frac{ny_1+my_2}{m+n}\\bigr)\\). Circle \\((x-h)^2+(y-k)^2=r^2\\).</p>
<p>Mensuration: cylinder \\(\\pi r^2 h\\), cone \\(\\frac13\\pi r^2 h\\), sphere \\(\\frac43\\pi r^3\\), CSA sphere \\(4\\pi r^2\\). Scale \\(k\\): area \\(k^2\\), volume \\(k^3\\).</p>
<p>Regular polygon interior \\(\\frac{(n-2)180}{n}\\). Number of diagonals \\(\\frac{n(n-3)}{2}\\).</p>
<div class="def">
<p><strong>From CAT 2017–2020 — geometry the papers used.</strong></p>
<ul>
<li><strong>Diamond \\(|x|+|y|=2\\).</strong> Area 8 (square with diagonal 4). Inequality \\(|x|+|y|\\le 2\\) minus the strip \\(|x|&lt;1\\) is a hexagon; compute as diamond minus two triangles, or pick’s / geometry of the band \\(|x|\\ge 1\\).</li>
<li><strong>Centroid.</strong> Medians divide a triangle into six small triangles of equal area. Cutting GBC off ABC leaves 2/3 of the area (the three small ones toward A). Area of 40-25-35 by Heron, then \\(\\times 2/3\\).</li>
<li><strong>Distance from a vertex to the hypotenuse</strong> is the altitude: \\(\\frac{ab}{c}\\). Min time at 30 km/h is that length over 30 (in hours, then \\(\\times 60\\)).</li>
<li><strong>Right isosceles, hypotenuse as diameter of a semicircle, plus an arc centred at A.</strong> Region between the semicircle and the arc: \\(\\frac12\\pi (c/2)^2 - \\bigl(\\frac14\\pi c^2 - \\frac12 a^2\\bigr)\\) — draw it; CAT 2017 S1 Q17 lands on 18, the two pizza-slices cancelling to the right triangle.</li>
<li><strong>Cube melted into five cubes 1:1:8:27:27 in volume.</strong> Side scale is cube root: 1,1,2,3,3. Surface \\(\\propto\\) side². Original volume 1+1+8+27+27=64, side 4. % extra surface \\(= (1+1+4+9+9)/16 - 1\\).</li>
<li><strong>Frustum / cut cone.</strong> Similar: height 12, cut 3 from the tip (9 from the base). Remaining volume \\(=\\) original minus small similar cone of height 3. Scale 3/12=1/4, volume factor 1/64.</li>
<li><strong>Cone cut parallel at 18 from the base, height 27.</strong> Small cone height 9, scale 1/3, volume 1/27 of original. Two pieces: small cone vs frustum. Difference 225 pins the original.</li>
<li><strong>Regular hexagon side 1, square on AC.</strong> AC is \\(\\sqrt{3}\\) (two equilateral heights? In hexagon AC skips one vertex: length \\(\\sqrt{3}\\)). Square area 3.</li>
<li><strong>Rectangle in a circle, diagonal = diameter = 26.</strong> \\(l^2+b^2=26^2\\). (24,10) works, (25,9) does not (625+81=706\\(\\ne\\)676).</li>
<li><strong>Two parallel chords same side, 4 and 6, gap 1.</strong> \\(r^2=(d)^2+3^2=(d+1)^2+2^2\\).</li>
<li><strong>Chord length \\(2r\\sin(\\theta/2)\\).</strong> 5 cm at 60° \\(\\Rightarrow\\) the 120° chord is \\(5\\sqrt{3}\\).</li>
<li><strong>Power / intersecting chords.</strong> Diameter 22, chord 20.5, CE=7 so ED=15. \\(AE\\cdot EB=CE\\cdot ED=105\\). Let AE\\(=x\\), EB\\(=20.5-x\\), \\(|EB-AE|\\).</li>
<li><strong>Angle in a semicircle + inscribed.</strong> Cyclic ABCD, \\(\\angle COD=120\\) is centre on arc CD so inscribed is 60; chase \\(\\angle BCD\\).</li>
<li><strong>Incircle of a rhombus.</strong> A rhombus has an incircle. \\(r=\\mathrm{area}/s\\) with \\(s\\) the semiperimeter. Diagonals 12, 16: area 96, side 10, \\(s=20\\), \\(r=4.8\\). Circle-to-rhombus area ratio \\(\\pi(4.8)^2/96=6\\pi/25\\).</li>
<li><strong>Medians perpendicular, 12 and 9.</strong> Area of triangle \\(=\\frac43\\times\\frac12\\times 12\\times 9=72\\) (four small right triangles of legs 8 and 6 around the centroid, since centroid splits 2:1).</li>
<li><strong>Equilateral, sum of perpendiculars from an interior point = height.</strong> Viviani. Area \\(= s^2 / \\sqrt{3}\\) if \\(s\\) is that height? Height \\(s\\), area \\(s^2/\\sqrt{3}\\). Yes CAT option.</li>
<li><strong>Chord through (3 E, 4 N) of O, radius 5.</strong> Power: distance OM from O to the chord (line AB). A is 4 north, B 3 east, chord is the line through them. Distance from O to AB, then chord \\(=2\\sqrt{r^2-d^2}\\).</li>
<li><strong>Concentric: chord of C1 tangent to C2, length 6, diameters differ by 2.</strong> \\(r_1^2 - r_2^2 = 3^2\\), \\(r_1=r_2+1\\), so \\(2r_2+1=9\\), \\(r_2=4\\), diameter of C1 is 10.</li>
<li><strong>Circumcircle of (0,0),(4,0),(3,9).</strong> Perp bisectors, or formula \\(R=abc/(4K)\\).</li>
<li><strong>Parallelogram opposite vertices (2,1), (−3,−4); other two on a line.</strong> Midpoint of both diagonals coincides: midpoint \\((\\frac{-1}{2},\\frac{-3}{2})\\) lies on the line of the other two, and the line is given as \\(x+9y+c=0\\) so plug the midpoint after finding the two points — or: the other two have midpoint that same, so the given line must pass through that midpoint, pinning \\(c\\).</li>
<li><strong>Grid paths (1,1)\\(\\to\\)(8,10) via (4,6), only right and up:</strong> binomial \\(\\binom{3+5}{3}\\times\\binom{4+4}{4}\\).</li>
<li><strong>Trapezium AB ∥ DC, BC ⊥ DC, \\(\\angle BAD=45^\\circ\\), DC=5, BC=4.</strong> Height 4, the 45° makes the overhang 4, so AB=5+4=9 (or |5-4| depending which way). Area \\(=\\frac{AB+DC}{2}\\times h\\).</li>
<li><strong>Infinite midpoint triangles of an equilateral.</strong> Each area is 1/4 of the previous. Sum \\(A/(1-1/4)=\\frac43 A\\) with \\(A=\\frac{\\sqrt{3}}{4}\\times 24^2=144\\sqrt{3}\\), total \\(192\\sqrt{3}\\).</li>
<li><strong>Brick face diagonals 3 : \\(2\\sqrt{3}\\) : \\(\\sqrt{15}\\).</strong> \\(l^2+b^2\\), \\(b^2+h^2\\), \\(h^2+l^2\\) in that ratio. Add pairwise to isolate edges, then shortest:longest.</li>
<li><strong>Square pyramid, equilateral triangular faces, side 20.</strong> Apex is directly above the square centre. Height from \\(10\\sqrt{2}\\) (half-diagonal) and slant 20: \\(h=\\sqrt{20^2-10^2-10^2}=10\\sqrt{2}\\).</li>
<li><strong>Max altitude to hypotenuse of a right triangle with hypotenuse 20</strong> is 10 (isosceles).</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> “Each edge \\(+10\\%\\)” volumes \\(+33.1\\%\\), not \\(+10\\%\\) and not \\(+30\\%\\). Height of equilateral is \\(\\frac{\\sqrt{3}}{2}a\\), not \\(a\\). Rectangle in a circle needs \\(l^2+b^2=(\\text{diameter})^2\\), not just “looks Pythagorean.”</div>
<div class="take"><strong>Move.</strong> Draw, mark equal angles, hunt one similar pair. If numbers are ugly, drop an altitude or use coordinates.</div>

`,

  modern: `
${sectionHead("sheet", "01", "Sheet")}
<p><strong>P&amp;C.</strong> \\(n! = n(n-1)\\cdots 1\\). \\(^nP_r = \\frac{n!}{(n-r)!}\\). \\(^nC_r = \\frac{n!}{r!(n-r)!}=\\,^nC_{n-r}\\). \\(^nC_r + \\,^nC_{r-1}=\\,^{n+1}C_r\\).</p>
<p>Permutations of multiset: \\(n!/(n_1!n_2!\\cdots)\\). Circular: \\((n-1)!\\) if rotations are the same; necklace with flips: \\(n!/2n\\) for \\(n\\ge 3\\) distinct (careful: CAT usually just \\((n-1)!\\)).</p>
<p>Number of functions \\(A\\to B\\): \\(|B|^{|A|}\\). Injective: \\(^nP_{|A|}\\) if \\(|B|=n\\ge|A|\\). Onto: inclusion-exclusion \\(n!\\,S(k,n)\\) or \\(\\sum_{i=0}^n (-1)^i \\binom{n}{i}(n-i)^k\\).</p>
<p><strong>Probability.</strong> \\(P=\\frac{\\#\\text{favourable}}{\\#\\text{total}}\\) equally likely. \\(P(A\\cup B)=P(A)+P(B)-P(A\\cap B)\\). Independent: \\(P(A\\cap B)=P(A)P(B)\\). Conditional \\(P(A|B)=P(A\\cap B)/P(B)\\). Bayes: \\(P(A|B)=\\frac{P(B|A)P(A)}{P(B)}\\).</p>
<p>Binomial: \\(P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}\\). At CAT, \\(n\\le 8\\) usually. Expected value of a count is linearity — you do not need independence.</p>
<p><strong>Sets / Venn.</strong> \\(|A\\cup B\\cup C|=\\sum|A|-\\sum|A\\cap B|+|A\\cap B\\cap C|\\). “Only \\(A\\)” \\(= |A|-|A\\cap B|-|A\\cap C|+|A\\cap B\\cap C|\\).</p>
<div class="def">
<p><strong>From CAT 2017–2020.</strong></p>
<ul>
<li><strong>Stars and bars with caps.</strong> Identical erasers to kids, each at least 1, at most 3: set \\(y_i=x_i-1\\in\\{0,1,2\\}\\), \\(\\sum y=3\\), four variables. Inclusion-exclusion or listing (CAT-scale). Pens: Amal \\(\\ge 1\\), Bimal \\(\\ge 2\\), Kamal \\(\\ge 3\\), 8 identical: shift \\(a'+b'+c'=8-6=2\\), non-neg, \\(\\binom{2+2}{2}=6\\).</li>
<li><strong>Integer solutions of \\(x-y-z=25\\)</strong> with upper caps. Let \\(y'=y\\), etc., or shift \\(x=25+y+z\\) and apply the three upper bounds; count the lattice rectangle that remains.</li>
<li><strong>Three points among 5 diameters plus centre, forming a triangle.</strong> Total \\(\\binom{11}{3}\\) minus collinear triples: each diameter with O is one line (\\(\\binom{3}{3}=1\\) per diameter? A,O,B collinear — 5 such triples). Also no three endpoints of distinct diameters are collinear through O except those.  \\(\\binom{11}{3}-5=160\\)? 165-5=160.</li>
<li><strong>4-digit from \\{0,2,3,4,6\\}\\), no repeat, divisible by 6 (even and digit-sum \\(\\div 3\\)), no leading 0.</strong> Casework on last digit even, then the rest, skip 0 first.</li>
<li><strong>Venn, “everyone who studies P also studies H or E.”</strong> Only-P is empty. 10 in the triple intersection, 20 in H\\(\\cap\\)E only. \\(|H|=|E|\\), universe 74. Fill the seven regions; the empty only-P is the key.</li>
<li><strong>Only-burger max/min.</strong> 105 pizza, 134 burger, 200 people. Only burger \\(= |B|-|P\\cap B|\\). Intersection between \\(\\max(0,105+134-200)=39\\) and \\(\\min(105,134)=105\\). Only burger between \\(134-105=29\\) and \\(134-39=95\\). 93 is inside, 96 is not.</li>
<li><strong>Symmetric difference</strong> \\(A\\Delta B=(A\\cup B)\\setminus(A\\cap B)\\) is associative. Compute element-wise on a 10-element universe, or note \\(x\\) ends in the result iff it sits in an odd number of the four sets.</li>
<li><strong>Juniors 43, seniors 51, girl-girl junior matches 153 \\(=\\binom{g_j}{2}\\)</strong> so \\(g_j=18\\). Boy-boy senior 276 \\(=\\binom{b_s}{2}\\) so \\(b_s=24\\). Then boy-girl matches = junior mixed \\(+\\) senior mixed.</li>
<li><strong>At least two subjects, all-three 18, maths 23, physics 25, min chemistry.</strong> Everyone has at least two, so the 18 triple already count toward each. Remaining maths 5 must pair with C or P; remaining physics 7 similarly. Min C is 18 plus the leftover who cannot go to MP only — 20 in the paper.</li>
<li><strong>3-digit with at least one repeated digit:</strong> 900 total 100–999, minus \\(9\\times 9\\times 8\\) strictly distinct (first 1–9, then rest avoiding used). 900-648=252.</li>
</ul>
</div>
<div class="miss"><strong>Trap.</strong> Arranging people with two particular together: glue as one, \\(\\times 2\\) for internal order. Complementary counting (total − bad) beats casework. Probability “at least one” is \\(1-P(\\text{none})\\). Only-X bounds come from inclusion-exclusion on the complement, not from “looks plausible.”</div>
<div class="take"><strong>Move.</strong> Write the sample space size first. If order doesn’t matter, C; if it does, P. For Venn, fill the innermost intersection first.</div>

`,

  sets: `
${sectionHead("sheet", "01", "Sheet")}
<p>CAT DILR is set selection, not “attempt all.” Forty minutes, five sets (recent pattern). Target for 99.7: two clean sets plus maybe a leftover TITA — about 8–10 correct, not heroics.</p>
<p><strong>Minute 0–3.</strong> Read the first 5–6 lines of every set. Rank: familiar skeleton, small integers, TITA that looks countable. Skip: nested “if A then unless B except C”, undefined figures, Q1 that already looks like an 8-minute grind.</p>
<p><strong>Abandon rule.</strong> 12 minutes and one answer \\(\\Rightarrow\\) leave. Sunk cost is how DILR percentiles die.</p>
<p><strong>Arrangements.</strong> Slots as columns. Place the most constrained person first. Circular: fix one person to kill rotational symmetry. Linear with neighbours: glue. “Not adjacent” = total − adjacent.</p>
<p><strong>Binary / games of truth.</strong> Two types (always-truth / always-lie, or two colours). Assume one statement, chase contradictions. Invariants: number of liars, parity.</p>
<p><strong>Quant based LR.</strong> Treat the paragraph as constraints on a table you drew. Don’t start arithmetic before the grid exists.</p>
<div class="miss"><strong>Trap.</strong> Opening the “interesting” set first. Interesting is not easy. Also: finishing a doomed set because you already spent 8 minutes.</div>
<div class="take"><strong>Move.</strong> After every mock, tag sets should-have-picked / correctly-skipped / should-have-skipped. That log is the syllabus.</div>

`,

  tables: `
${sectionHead("sheet", "01", "Sheet")}
<p>Copy the grid. Unknowns as letters. Row/column totals are equations — write the tightest first. “At least / at most / unique” stay inequalities until forced. Stop when the asked quantity is determined; CAT will not always need the full fill.</p>
<p><strong>Round-robin</strong> of \\(n\\): games \\(= n(n-1)/2\\). Total wins \\(=\\) total losses \\(=\\) games (no draws). Points: read the scoring (2/1/0 vs 3/1/0). A team plays \\(n-1\\) games; wins \\(\\le n-1\\).</p>
${eq("\\sum \\text{wins} = \\#\\text{games},\\qquad \\sum \\text{points} = (\\text{pts per game})\\times\\#\\text{games}")}
<p>Matrix: dash on the diagonal. Fill forced W/L from “A beat everyone except B”, then the points column. Two parallel groups + a final is two tables, not one.</p>
<p>Networks at CAT scale: enumerate. Max flow is usually a 6-node picture, not Ford–Fulkerson theatre.</p>
<div class="miss"><strong>Trap.</strong> Assuming 2 points for a win. Assuming no draws. Completing the table when Q1 only needs a comparison of two forced cells.</div>
<div class="take"><strong>Move.</strong> Pick a tournament if \\(\\le 6\\) names and one scoring sentence. Pick a table if two totals are given and numbers are small integers.</div>

`,

  rc: `
${sectionHead("sheet", "01", "Sheet")}
<p>No grammar syllabus. About 16 of 24 VARC marks are RC. Read for the author’s project, then paragraph jobs (example, contrast, caveat, implication).</p>
<table class="data">
<thead><tr><th>Type</th><th>Kill if</th></tr></thead>
<tbody>
<tr><td>Main idea</td><td>It covers only the colourful example, or adds a moral the author did not draw.</td></tr>
<tr><td>Inference</td><td>World-true but passage-silent; modal flip (some \\(\\to\\) all).</td></tr>
<tr><td>EXCEPT / NOT</td><td>You pick the loud true extra instead of the unsupported one.</td></tr>
<tr><td>Strengthen / weaken</td><td>You never isolated the claim.</td></tr>
<tr><td>Tone</td><td>You pick “scathing” for a hedged academic.</td></tr>
</tbody>
</table>
<div class="miss"><strong>Traps.</strong> Extreme words. Scope shift (India \\(\\to\\) the world). Opposite of a hedge. True in life, absent in text.</div>
<div class="take"><strong>Volume.</strong> Two timed RCs a day plus 30 minutes of unread dense prose (Aeon / Hindu editorial / Economist science). Not spoken English.</div>

`,

  va: `
${sectionHead("sheet", "01", "Sheet")}
<p>Eight questions, often TITA. RC first; VA in leftover 10–12 minutes. Two 90-second TITA jumbles beat one 5-minute stall.</p>
<p><strong>Jumble.</strong> Opener = most general, no stranded pronoun, no “however / this / such.” Lock pairs (noun\\(\\to\\)pronoun, term\\(\\to\\)definition, problem\\(\\to\\)solution). Chronology and logic connectors pin the rest.</p>
<p><strong>Summary.</strong> Complete and unpadded. Kill narrower-than-paragraph, broader-than-paragraph, hedge-to-certainty.</p>
<p><strong>Odd one out.</strong> Neighbour topic or different agent/time. Remaining three must jumble.</p>
<p><strong>Para completion.</strong> Last sentence licensed by what is already there. A witty new essay is wrong.</p>
<div class="miss"><strong>Trap.</strong> The interesting sentence as opener. CAT openers are boring topic sentences.</div>
<div class="take"><strong>Move.</strong> For TITA jumbles, write the four letters in order; don’t permute all 24 if two pairs are locked.</div>

`,
};
