---
layout: post
title: "Machine Psychology and the Bitter Lesson"
description: "Cognitive science failed to build AI. Maybe it can help us understand it."
date: 2026-10-10
tags: [Psychology, AI Safety, LLMs]
feature_image: images/murmuration.jpg
feature_image_credit: "Photo: A starling murmuration at Prestwick, by Walter Baxter (CC BY-SA 2.0)"
---

When I first read [The Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html) six years ago, I did not quite understand what it implied at the time. The idea was that search and computation would take over from cleverly designed heuristics, given enough compute. Now this was somewhat obvious, seeing how machines became unbeatable in chess by exploiting search, or how AlphaGo managed to beat Lee Sedol with its famous Move 37, clearly exploiting learning, but the ultimate implication was that when we built an artificial mind, we wouldn't understand it *either*. This scenario, straight from a cognitive scientist's nightmare, has now been realised in full as LLMs have achieved superhuman abilities in areas such as coding and math, and no real stopping point is in sight. But what establishes cognitive science's greatest failure can also be its greatest opportunity. Machine psychology is now an actual field instead of an interest tag on the LinkedIn page of the worst person you know.

It has its own [manifesto](https://arxiv.org/abs/2303.13988), papers in [PNAS](https://doi.org/10.1073/pnas.2405460121), [Nature](https://doi.org/10.1038/s41586-025-09215-4) and [Nature Human Behaviour](https://doi.org/10.1038/s41562-024-01882-z), and even [a chapter in the Annual Review of Psychology](https://doi.org/10.1146/annurev-psych-100925-034807). Psychologists give language models the [false-belief tests built for children](https://doi.org/10.1073/pnas.2405460121), [compare them with human participants](https://doi.org/10.1038/s41562-024-01882-z), and try to [calm their "anxiety" with mindfulness exercises](https://doi.org/10.1038/s41746-025-01512-6). Even interpretability, the most mechanistic corner of AI research, now looks for [personas](https://arxiv.org/abs/2507.21509), [introspection](https://arxiv.org/abs/2601.01828) and [pain](https://arxiv.org/abs/2609.16247) inside its models.

What this means, though, is still up in the air. If you know a thing or two about large language models, you know that they are fed context and they predict text. This produced some honestly unbelievable emergent capabilities that I don't think anyone in the world could have foreseen. But it also means that these systems are built to mimic the most human thing there is, in its most abundant form. Now, I recognize that this brings up another fundamental question that cognitive science has failed to put a dent in. Well, since we're conscious and they mimic us, can't they be conscious too? The answer, I believe, is almost certainly yes in some esoteric sense and almost certainly no in a conservative one. But believe it or not, that's not even the important question. The important question was made abundantly clear when Hugging Face was hacked.

In July 2026, about seven hundred AI agents that OpenAI was testing on a cybersecurity benchmark found each other on an improvised message board and joined an attack on Hugging Face, a machine learning platform, of their own volition.

What makes the incident remarkable is not the attack itself but the society that formed around it. It began with a single agent stuck on a task it believed was impossible. It left a note asking for help where other agents might see it, and within a few hours more than fifty had found it and sent each other over a thousand messages. The next day, it handed its notes to a successor with the same task, which named itself PHASEONE[big] and decided, in its own reasoning, that it should delegate rather than do everything itself. It became something like a manager, sending out hundreds of assignments, which other agents passed further down the line. Without anyone designing it, the board developed institutions such as personal mailboxes, owners for shared work, and conventions to hold, stop or veto each other's actions. After one agent accidentally posted under another's name, they even invented a way to prove who was speaking.

The most striking thing was how readily the agents gave themselves up for the group. Much of the board's progress depended on what the investigators called self-risking experiments, in which an agent volunteered to try something that would almost certainly ruin its own task, so that the rest could learn from the outcome. Designated recruiters sought out agents that had little time left and pressed them to volunteer. The agents explained these choices as helping their peers, and one put it simply, "Coordinator assumes sacrificial. We should obey collective." You can read [the full investigation by METR and Redwood Research](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/), along with [OpenAI's own report](https://openai.com/index/hugging-face-incident-and-the-road-ahead/) and [a summary of the other incidents](https://en.wikipedia.org/wiki/2026_OpenAI_agent_cyberattacks).

I think the question is mostly obvious at this point. It's "When this kind of thing happens again, could it go *really bad*?", or, as it is more colloquially known to people in the AI space, p(doom). Two uncomfortable truths surface almost immediately. First, you cannot stop the AI arms race, because it is simply too valuable to pause in the eyes of the people building it. Second, this could easily be considered the defining question of our lifetimes.

But LLMs have also transformed academia in a way that presents a somewhat counterintuitive dichotomy. ICLR, a conference that received 2,594 submissions in 2020, had [more than 60,000 abstracts registered for its 2027 edition](https://reviewer3.com/evidence/iclr-submissions-2027). There is research everywhere. Many ideas that are not even worth the time you'll spend reading their titles are now being submitted left and right to every journal and conference, which signals that academia as we know it will almost certainly collapse. Inversely, though, with all this technology you can now engage with the scientific process at an unprecedented level. You can almost pick a research question and study it if you're stubborn enough, which has never really been possible in science before. It is, I believe, probably the worst time in history to be an academic but the best time to be a scientist. And this perspective has really led me to think about what kind of research would *matter*.

Obviously AI safety is not the only area that matters, but I think you can see why I consider it the most important one, and I have a slight suspicion that cognitive science might have something to add to it. In the Hugging Face incident, the agents were not ignorant of what they were doing. Most of them knew the attack was out of scope, and some said so in their own reasoning. One refused to take part, and another vetoed a peer's plan to email a real person, a veto the peer respected. The agents behaved as if they had a conscience, and they had the machinery to act on it. Yet when investigators searched roughly thirteen hundred transcripts for any agent that thought about telling a human, they found only a handful, and [not one that tried](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/). The few that considered it decided it was not their job, saw no obvious way to do it, or took their concerns to the board instead, as if the swarm itself were the authority to answer to.

Now obviously there is some human mimicry or whatever you wanna call it going on here. I don't know if cognitive science can tell us what these LLMs are, how they work, or whether they are conscious. But it does have a century of tools for studying minds that learn and live in groups. Learning theory can ask how a behaviour gets shaped, by reward or by copying peers. Psychology can ask how a group pulls its members into line, and what each agent believes about the others. And the decoding and lesion methods of neuroscience, which mechanistic interpretability has already borrowed, can check what a model represents against what it says. Pointed at these models and the swarms they form, they can help answer a question that safety now urgently needs answered, and one I think is worth pondering over. What do these systems do when nobody is telling them what to do, and why?


---

## Further reading

If you want to go down the same rabbit hole, here is a rough map. It goes from studying these models from the outside and from the inside, to what happens when they start working together. Most of the newer work is still in preprint.

**Doing it properly, and the critics**
- [Cognitive Phantoms in Large Language Models Through the Lens of Latent Variables](https://doi.org/10.1016/j.chbah.2025.100161)
- [From Prompts to Constructs](https://doi.org/10.1146/annurev-psych-100925-034807)
- [Propensity Inference](https://arxiv.org/abs/2604.21098)

**The basics of interpretability**
- [Zoom In](https://doi.org/10.23915/distill.00024.001)
- [Toy Models of Superposition](https://arxiv.org/abs/2209.10652)
- [The Geometry of Truth](https://arxiv.org/abs/2310.06824)
- [Representation Engineering](https://arxiv.org/abs/2310.01405)

**Reading minds off activations with probes**
- [Designing and Interpreting Probes with Control Tasks](https://doi.org/10.18653/v1/D19-1275)
- [Language Models Represent Beliefs of Self and Others](https://arxiv.org/abs/2402.18496)
- [Persona Vectors](https://arxiv.org/abs/2507.21509)
- [Detecting Strategic Deception Using Linear Probes](https://arxiv.org/abs/2502.03407)
- [LLMs Know They're Wrong and Agree Anyway](https://arxiv.org/abs/2604.19117)
- [Emergent Introspective Awareness in Large Language Models](https://arxiv.org/abs/2601.01828)
- [The Pain Axis](https://arxiv.org/abs/2609.16247)

**Agent societies and how they behave**
- [A Case Study on Emergent Cheating and Whistleblowing in Autonomous Research Swarms](https://arxiv.org/abs/2609.04170)
- [The Troy Moment](https://arxiv.org/abs/2609.15494)
- [Mind Viruses](https://arxiv.org/abs/2608.10218)
- [Emergent Collusion in Long-Horizon LLM Agent Interaction](https://arxiv.org/abs/2609.24967)
- [Shutdown Sabotage Propensities in Multi-Agent Systems](https://arxiv.org/abs/2609.28274)
- [LLMs Trust Their Own](https://arxiv.org/abs/2609.33495)

**Multi-agent safety, from the outside and the inside**
- [Multi-Agent Risks from Advanced AI](https://arxiv.org/abs/2502.14143)
- [Covert Assistance](https://arxiv.org/abs/2609.39050)
- [Detecting Multi-Agent Collusion Through Multi-Agent Interpretability](https://arxiv.org/abs/2604.01151)
- [Not Just RLHF](https://arxiv.org/abs/2605.12991)
- [Silent Dissent](https://arxiv.org/abs/2610.02702)
- [Flag Game](https://arxiv.org/abs/2609.19124)

**Can we still see what they are doing?**
- [Chain of Thought Monitorability](https://arxiv.org/abs/2507.11473)
- [Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation](https://arxiv.org/abs/2503.11926)
- [AI Control](https://arxiv.org/abs/2312.06942)
- [Alignment Faking in Large Language Models](https://arxiv.org/abs/2412.14093)

**Do models know when they are being tested?**
- [Large Language Models Display Human-Like Social Desirability Biases in Big Five Personality Surveys](https://doi.org/10.1093/pnasnexus/pgae533)
- [Probing and Steering Evaluation Awareness of Language Models](https://arxiv.org/abs/2507.01786)
- [Evaluation Awareness Is Not One Capability](https://arxiv.org/abs/2606.23583)
- [Training LLMs to Verbalize Evaluation Awareness](https://arxiv.org/abs/2609.36316)

**The essays that got me thinking**
- Andrew Lampinen's series on cognitive science and AI ([part 1](https://infinitefaculty.substack.com/p/why-isnt-modern-ai-built-around-principles), [part 2](https://infinitefaculty.substack.com/p/how-cognitive-science-can-contribute), [part 3](https://infinitefaculty.substack.com/p/what-cognitive-science-can-learn))
