# A small local judge passed its pilot. Fresh data killed it.

By Eeshan Gupta. Published 4 November 2026. Canonical page: https://eeshangupta.com/writing/small-judge-fresh-data/
[YOU REWRITE: opening, 3 to 5 sentences, your prose. Lead with what you did. Notes from your interview answers: - You have a 6 GB graphics card (GTX 1660 Ti). Larger models do not fit in that memory. - You wanted use cases for small models; acting as a judge was one idea you wanted to test. - You expected the judge to hold up on fresh data "or at least show good performance". - Facts for the second half of the opening: the pilot passed, the confirmation on new data did not, and a different small-model idea (a cascade) did survive. - No label fragments, no "not X, it's Y".]

## What I tested

The judge's job was to check whether a RAG answer sticks to its source (faithfulness), the task a large paid model usually does. I tried two small-model ideas on public data and committed the rules in git, with tagged freezes, before I computed any result. Everything ran locally and no paid API was called.

The judges were MiniCheck-Flan-T5-Large (Tang, Laban and Durrett, EMNLP 2024), a small fact-checking model, and Qwen3-4B-Instruct-2507 (Qwen3 Technical Report, 2025) in 4-bit as a yes/no judge.

A few measures appear below. Kendall tau-b is rank agreement between two lists, from -1 (reversed) to 1 (same order), corrected for ties. Cohen's kappa is agreement between two raters corrected for chance: 0 is chance level, 1 is perfect, and negative values mean worse than chance. Balanced accuracy averages the true-positive and true-negative rates. A bootstrap 95% interval comes from resampling the data 1,000 times and taking the middle 95% of the results.

## The pilot passed

The first idea was ranking. A judge that ranks whole generators only has to say which systems hallucinate more, so it can be wrong on many single items if its per-generator rates follow the human rates.

The pilot used the six generators in the RAGTruth QA test split (Niu et al., ACL 2024), 150 items each. Human annotators put hallucination rates between 0.7% for gpt-4-0613 and 34.7% for llama-2-7b-chat. Qwen3-4B flagged 7.3% of gpt-4's answers and 34.0% of llama-2-7b's. Kendall tau-b between human and judge rates was 0.733, with a 95% interval of [0.414, 1.000], and the three quality tiers came out in the right order. My rule said scale. The exact permutation p-value was 0.056, and I had written down that six units cannot carry a significance claim.

## Fresh data killed it

I froze a second plan, prereg-B2-frozen, before any judge saw the new data: FaithBench (Bao et al., NAACL 2025). It has 800 summaries, 80 source documents each summarized by the same 10 LLMs, with human labels. The prompt, the 0.5 cut and the model were unchanged from the pilot. Scale needed tau-b of at least 0.5 and the right tier order. Kill meant a wrong tier order or tau-b below 0.3.

|  | RAGTruth pilot | FaithBench confirmation |
|---|---|---|
| Generators | 6 | 10 |
| Items per generator | 150 | 80 |
| Kendall tau-b, Qwen3-4B | 0.733 | 0.048 |
| 95% bootstrap interval | [0.414, 1.000] | [-0.167, 0.523] |
| Tier order correct | yes | no |
| Item-level kappa / balanced accuracy | 0.161 / 0.587 | 0.030 / 0.518 |
| Pre-registered verdict | scale | kill |

![Two scatter plots of judged unfaithful rate against human rate, each with a dashed y = x line. Left, the 10 FaithBench generators, High-hallucination tier in orange and Low-hallucination tier in blue: human rates run 46% to 73%, judged rates 9% to 20%, all far below the line, and the two tiers overlap. Right, the 6 RAGTruth pilot generators: the points lie close to the line.](https://eeshangupta.com/writing/small-judge-fresh-data/fig1-judge-vs-human.png)

Figure 1: judged unfaithful rate against human rate for the 10 FaithBench generators (left, tiers coloured) and the 6 RAGTruth pilot generators (right); the dashed line is y = x.

The permutation p-value was 0.92. The lowest judged rate in the High tier (0.125, Qwen2.5-7B) sat below the highest in the Low tier (0.200, claude-3-5-sonnet). Of the High-Low generator pairs, 42% had the judge ordering them the right way, below the 50% a coin gives. Averaging the probabilities instead of using the 0.5 cut gave tau-b of 0.045, so the cut was not the cause. The judge also under-flagged: 9% to 20% of summaries per generator against 46% to 73% from annotators.

## What surprised me[YOU REWRITE: surprises, in your words. Notes from your interview: you expected it to outperform on fresh data too, or at least show good performance. Facts to pick from: - the pilot passed with tau-b 0.733 and a correct tier order, and the replication returned a number near zero; - MiniCheck, the exploratory judge, did better on FaithBench than Qwen (tau-b 0.341, interval [0.116, 0.612], tier AUC 0.854) and still ended as a kill under the strict tier rule; - the cascade that struggles on RAGTruth works on WiCE. [YOUR DETAIL: your reaction when you saw the 0.048.] Avoid "honest" and "worth noting".]

## What the small model can still do

The second idea was a cascade: a fast small model checks every item, and only the items it is unsure about go to the slower judge. MiniCheck answers first. When its probability is far from 0.5 its verdict stands, and unsure items go to Qwen3-4B, which takes about 19 seconds per WiCE item against a fraction of a second for MiniCheck. The confidence threshold was picked out-of-fold (5-fold cross-fitting), so it was not tuned on the items it was scored on.

The target was set in advance: Cohen's kappa had to reach 0.9 times a published Sonnet kappa for that dataset (0.493 for WiCE, 0.541 for RAGTruth). Those Sonnet figures come from a different sample than mine, so the comparison is indicative at best.

On WiCE (Kamoi et al., EMNLP 2023; 172 items) MiniCheck decided 81% of items on its own (out-of-fold), and kappa on those items was 0.502. Over all items, the cascade's kappa was 0.488, just under the 0.493 target. Its error rate was 0.256 against 0.244 for Qwen3-4B alone; the difference of 0.012 has a 95% interval of [-0.041, 0.081], so the cascade made no measurable difference to errors. Expected time per item fell from 18.79 s to 3.50 s. On RAGTruth (300 items) the same cascade let MiniCheck decide 21% of items on its own, which met the 20% coverage gate, but its interval of [0.027, 0.577] is very wide and its kappa over all items was 0.313 against a target of 0.541. The rule needed both datasets to reach their target, and neither did (WiCE 0.488 against 0.493, RAGTruth 0.313 against 0.541), so the verdict was iterate, not scale.

So the practical answer is narrow. On one dataset a small model can screen the easy claims and send the rest on, with errors no worse than the slow model's. On the ranking test, the one that would let a small model replace a large judge when comparing generators, it could not.

## Limits

- FaithBench items were chosen where five existing detectors disagreed most, so the data is hard for detectors by construction. About 60% of summaries are labelled "Unwanted", far above natural rates. Two of those five detectors (GPT-4o and GPT-3.5) are also generators in the list.
- All 10 generators summarized the same 80 source documents, so the summaries are clustered by document. The intervals come from a bootstrap over documents, and the result holds for that document sample only.
- With 80 summaries per generator each rate has a binomial interval of about plus or minus 11 points. The High and Low tiers are about 11 points apart (0.59 against 0.70), so the test could resolve the coarse split and not the order inside a tier. The six RAGTruth generators have the same problem: the middle four differ by 1 to 6 items out of 150.
- The tiers come from the human labels, which are the answer key. I placed the boundary at the largest gap in this dataset's own human rates, before any judge output existed. That makes the tier check partly circular, which is why tau-b over all 10 generators was a second criterion.
- I used one prompt and one uncalibrated 0.5 cut. A calibrated cut might rank better; I did not run it.
- Dropping GPT-4o and GPT-3.5, the two detectors that are also generators, moved tau-b to -0.615 with an interval of [-0.692, 0.315] on the remaining 8 generators, and the tier order still failed. That check was exploratory.
- Qwen2.5-7B is one of the generators and the judge is Qwen3-4B, so they share a model family. Dropping that generator gave tau-b of 0.216 with an interval of [-0.141, 0.657], and the tier order still failed. That check was exploratory.
- The B2 plan froze with open objections. A Gemini model audited it for three rounds and still asked for changes, among them the strict tier rule and the uncalibrated cut. I froze anyway and listed the open points in the file. They could have made the kill easier to hit. The result also fails on tau-b alone (0.048 against the 0.3 floor), which does not depend on the strict tier rule.
- The Part A target is a published figure from a different sample, and the analysis is a re-analysis of data and models I had already seen in an earlier job. I chose Qwen3-4B as the primary model after seeing those results. The Part A sets are class-balanced pairs (half faithful, half hallucinated), not the natural mix, and the 300 RAGTruth items are skewed toward one generator (148 of 300 are gpt-4). Treat Part A as a lead worth confirming.

## Where this leaves the judge[YOU REWRITE: the ending, in your words. One concrete next step and one open question only; no summary closer. Facts: the cascade idea survives on WiCE and needs fresh items; the ranking idea passed a pilot and failed on a hard, detector-filtered set, and the six-generator pilot is now an example of a pilot that did not hold. [YOUR DETAIL: what you will do next with this, or stop doing].]

## How I ran this

- The rules were committed and tagged before the results: prereg-AB-frozen on 28 October 2026 at 02:20 IST and prereg-B2-frozen the same day at 22:38 IST. The FaithBench report was committed at 00:38 IST on 29 October. [REPO LINK] [YOUR DETAIL: repo link, if you publish it.]
- The 900 RAGTruth predictions were generated before the first freeze as input preparation, and no metric was computed from them.
- FaithBench is CC BY-NC-SA, so the data is not in the repo.
- References: RAGTruth (Niu et al., ACL 2024); WiCE (Kamoi et al., EMNLP 2023); FaithBench (Bao et al., NAACL 2025, arXiv 2410.13210); MiniCheck (Tang, Laban and Durrett, EMNLP 2024); Qwen3 Technical Report (Yang et al., 2025, arXiv 2505.09388).
