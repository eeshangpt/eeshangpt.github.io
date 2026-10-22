# Is GraphRAG worth it? A small, pre-registered test against a properly tuned baseline

By Eeshan Gupta. Published 24 October 2026. Canonical page: https://eeshangpt.github.io/writing/graphrag-vs-tuned-hybrid/

[YOU REWRITE: opening]

If you build retrieval-augmented generation (RAG), you have seen the pitch for graph-based retrieval. Extract entities and relations from your documents, build a graph, and multi-hop questions get answered better. Most papers compare the graph method against a plain dense retriever. A careful team would not ship that. It adds keyword search, fuses the rankings and reranks.

I wanted to know one thing. If a graph method and a properly tuned hybrid retriever hand the generator the same amount of context, how much of the graph's advantage is left?

So I ran a small pre-registered experiment. I wrote down the hypotheses, metrics and decision rules before the results existed. This write-up covers all of it, including the parts I could not finish.

[YOUR DETAIL: why you wanted to test this, and what you expected before the numbers came in.]

## Why the baseline matters

Graph indexing costs something: an LLM pass over the whole corpus, a graph to maintain, more to debug. If a tuned hybrid retriever gets you most of the way, you can skip all that. The useful bar is the baseline I would actually deploy, and plain dense search is a much lower one.

## The setup

I used two public multi-hop question sets, MuSiQue and 2WikiMultiHopQA (2Wiki). They come as the 1,000-question samples and pooled passage corpora from the HippoRAG 2 paper, with 11,656 passages for MuSiQue and 6,119 for 2Wiki. Retrieval searches the whole pooled corpus.

Every arm used the same generator and the same context budget. The arms were:

- Dense only, with the open bge-small embedding model.
- A tuned hybrid that fuses BM25 keyword search and dense search with reciprocal rank fusion, then reranks with a cross-encoder (bge-reranker-base). Its settings were fixed in advance and never tuned on the evaluation questions.
- A graph arm, my lightweight re-implementation of HippoRAG 2, with extracted triples, a graph and personalised PageRank over it. I call it HippoRAG 2-lite because it skips the query-time LLM step that filters triples.
- BM25 alone.
- A control with no context.

Each arm got at most 1,000 tokens of context, filled with whole passages in rank order. The generator was Claude Sonnet 5.5, prompted to answer briefly or say "unanswerable". That refusal option matters, and I come back to it below.

Token F1 is the standard SQuAD word-overlap score between the answer and the gold answer. 1.0 is a perfect match and 0 is no overlap. I report differences in points, so 0.19 is 19 points.

For uncertainty I used a bootstrap confidence interval (CI). I resample the questions 10,000 times and take the middle 95% of the results, which shows how much the number would move on a different set of questions. Paired means both methods are scored on the same questions, so I bootstrap the per-question difference.

To ask whether two methods are equivalent I used TOST, two one-sided tests. It checks whether the difference sits inside a margin you chose in advance. I chose plus or minus 4 F1 points. I widened it from 2 after the pilot because 2 was untestable at this sample size, and the published 2.9-point gap sits inside it. TOST checks the 90% interval against the margin. Failing to find a difference says little. TOST can actually show that two methods are close enough.

The confirmatory sample is 950 questions per dataset. The first 50 informed my design decisions, so I excluded them.

[YOUR DETAIL: how you decided on the 950/50 split.]

## Results

| Retriever (1,000-token budget) | MuSiQue F1 | 2Wiki F1 |
|---|---|---|
| No context | 0.005 | 0.000 |
| Dense only | 0.294 | 0.363 |
| BM25 only | 0.218 | 0.341 |
| Hybrid (fusion only) | 0.296 | 0.379 |
| Tuned hybrid (fusion + rerank) | 0.348 | 0.372 |
| Graph (HippoRAG 2-lite) | 0.382 | 0.562 |

![Bar chart of F1 for dense, tuned hybrid and graph retrieval on MuSiQue and 2Wiki, with 95% confidence intervals. The graph bar is far above on 2Wiki and slightly above on MuSiQue.](https://eeshangpt.github.io/writing/graphrag-vs-tuned-hybrid/fig1-f1-by-arm.png)

Figure 1. Token F1 by retrieval arm and dataset, with 95% confidence intervals.

The comparison that matters is graph minus tuned hybrid.

On 2Wiki the graph won by 19.0 F1 points (95% CI [+16.1, +22.0]). Not close. In this setup a tuned hybrid was no free substitute for the graph.

On MuSiQue the gap was +3.5 points (95% CI [+0.4, +6.5]). That looks like a small graph edge, but the equivalence test was inconclusive. The data could not show that the two methods are within 4 points of each other, and it could not show that the graph is more than 4 points better.

I had registered a rule for dropping the "graph is overrated" angle. It required the graph to win by more than 5 points, with the 95% interval's lower bound above zero, on both datasets. MuSiQue failed it. My hypotheses that the tuned hybrid is enough were not supported either. The verdict is iterate, and neither side of my original question is settled.

## What surprised me

[YOU REWRITE: surprises]

![Paired difference in F1 points, graph minus tuned hybrid, with 95% intervals and the plus or minus 4 point equivalence band. The 2Wiki interval sits far right of the band; the MuSiQue interval overlaps its edge.](https://eeshangpt.github.io/writing/graphrag-vs-tuned-hybrid/fig2-graph-minus-hybrid.png)

Figure 2. Graph minus tuned hybrid, paired, with the plus or minus 4 point equivalence margin.

### The tuned hybrid helped on one dataset and did nothing on the other

On MuSiQue the full tuned hybrid added 5.4 points over dense (CI +2.9 to +7.9), almost all of it from the reranker. On 2Wiki it added 0.9 points (CI -0.7 to +2.5), which is indistinguishable from zero. For 2Wiki I had registered that a tuned hybrid would close at least half the gap between dense retrieval and the graph. It closed about 5% of it. On MuSiQue the same share was 61%, but there I had registered a different hypothesis, so read that as descriptive.

[YOUR DETAIL: whether you expected the reranker to help 2Wiki too.]

### The graph's win varies by question type

I split 2Wiki by question type. The split was registered as exploratory only, so it is a lead and nothing firmer. The graph was ahead by 25 to 28 points on compositional, bridge-comparison and inference questions. On plain comparison questions (n=232) the hybrid was better by 6.5 points. My reading is that the graph helps when questions chain facts. I did not test that.

### The graph found more of the evidence in the same budget

On 2Wiki, the share of supporting passages that made it into the context was 0.87 for the graph and 0.71 for the tuned hybrid. On MuSiQue it was 0.61 versus 0.60. The 2Wiki gap looks like a retrieval effect, though I did not isolate it.

### A prompt nearly fooled my evaluation

In the pilot, a "give your best guess" prompt let the model answer many questions from memory, because both datasets are built from Wikipedia. The real run used a refusal prompt. Under it, F1 on questions whose context did not contain the gold answer stayed between 0.000 and 0.033 for every arm, well under my threshold of 0.10. In the pilot, the same statistic under the guess prompt was 0.35 to 0.53, which would have failed. If you evaluate RAG on Wikipedia questions, measure this.

[YOUR DETAIL: when and how you noticed the pilot scores looked too good.]

### The cost depends on a step I did not run

Graph indexing cost about $3.18 for MuSiQue (from the paper's published token counts) and $4.47 for 2Wiki (measured), at a cheap reference API rate. As run, per-query cost is about the same for both arms, so the premium only shrinks relative to total spend. It falls below 10% of the hybrid's total after roughly 212,000 queries on MuSiQue or 331,000 on 2Wiki. That summary is one I registered myself and it is not a standard metric.

The real HippoRAG 2 filters triples with an LLM call at query time. I estimated that cost from the paper's prompt without running it. With it, the graph's per-query cost exceeds the hybrid's, so that volume is undefined. Treat the cost story as an estimate.

## Limits

- Context sizes were not identical. Mean context was within 15% across arms except on 2Wiki, where the graph averaged 755 tokens against 900 for BM25, a 16% gap.
- I used one generator, Claude Sonnet 5.5, with one generation per question and no temperature control. A different generator may change the gaps. Between 33% and 65% of answers were refusals, so F1 partly measures whether retrieval supplied enough to answer.
- Both datasets come from Wikipedia and the budget was small, with no repeated runs. I would not extend these results to other kinds of documents.
- The two graphs were built differently. The MuSiQue graph uses the HippoRAG authors' precomputed extraction (gpt-4o-mini). I built the 2Wiki graph with Claude Sonnet, the same family as the generator. That could favour the graph on 2Wiki, and it means the two datasets are not cleanly comparable.
- The embedder is a small one, smaller than the paper's large one, which weakens the dense and hybrid arms. My graph arm also has no query-time triple filter.
- The MuSiQue result is underpowered. The equivalence test could not give an answer, and at the observed variation its power was roughly two thirds. A larger sample might resolve it.
- I missed two commitments. I had registered a second look at a 2,000-token budget, and a measurement of how often the generator fills gaps from memory under the guess prompt. I ran neither. Both need thousands more generator calls. My original protocol said an "iterate" verdict means adding the 2,000-token budget. After seeing a preview of the headline numbers, I wrote down that it would run only on "scale". That was a post-hoc call. At 1,000 tokens the gold answer was in context for only 37 to 56% of MuSiQue questions (59 to 86% on 2Wiki), so every conclusion here holds at that budget only.
- One protocol file was frozen late. An amendment (dropping the 50 design questions, adding cost reporting) was drafted before any results but frozen after the runs finished. Nothing changed after the data existed and I had read no result at freeze time. It is still a hole in the pre-registration.

[YOUR DETAIL: why you decided to skip the 2,000-token run.]

## What's next

[YOU REWRITE: ending]

I am iterating. Next, most likely, is the 2,000-token check for the graph and the tuned hybrid. After that I want to run the real query-time triple filter, so its cost is measured and not estimated, and then try a corpus that looks like documentation instead of Wikipedia. What I still do not know is whether the MuSiQue edge survives a bigger sample.

## How I ran this

- The question, hypotheses, systems, metrics and decision rules were committed to a repository before any pilot number existed. Two amendments followed, after the pilot and after a design audit. Each is frozen with a git tag, and a deviations log lists every departure from the plan.
- F1 was recomputed from the saved answers with 0 mismatches. The run had not logged retrieved passage ids, so I re-ran retrieval to reconstruct them. It reproduced the generation run on 9,987 of 10,000 arm-rows.
- A model from a different family, Gemini instead of Claude, reviewed the protocol amendments and the results analysis. The results audit returned two corrections, both valid and fixed, and approved on the second round.
- I used token F1 and exact match (SQuAD, Rajpurkar et al. 2016), a paired percentile bootstrap (Efron 1979) and TOST equivalence (Schuirmann 1987).
- Code, data and the pre-registration history: [https://github.com/eeshangpt/graphrag-vs-tuned-hybrid](https://github.com/eeshangpt/graphrag-vs-tuned-hybrid)
