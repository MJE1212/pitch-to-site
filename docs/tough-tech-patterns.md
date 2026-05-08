# Tough Tech Website Patterns — Reference for SiteGen Prompts

This doc distills patterns from 17 real Tough Tech sites that the prompt library in `src/lib/ai-prompts.ts` is designed to emulate. When changing a prompt, check the relevant rule here first.

**Sites analyzed:** sitration.com, robigo.bio, pascaltechnology.com, lithiosinc.com, teragenenergy.com, dropgenie.com, foundationalloy.com, openstar.tech, nanopath.com, anvildiagnostics.com, coperniccatalysts.com, reynko.com, quantumformatics.com, rockzero.com, foraybio.com, dropletbiosci.com, anthology.bio.

---

## The single biggest takeaway

**Specificity is the whole game.** Every section in these sites would *break* if you tried to relocate it to another company's site without losing meaning. Numbers, named markets, named incumbents, named papers, named investors. The "wireframe feel" we're trying to avoid comes from any sentence that could be moved between two sites without losing meaning.

---

## Hero formulas that work (cap: 12 words; sweet spot: 5–6)

1. **Outcome + qualifier** — "Crop Protection Without Compromise" (Robigo). Short noun phrase + "without X."
2. **Category claim** — "The 21st century metals company" (Foundation Alloy). Naming the category, not the product.
3. **Input → Output → Promise (staccato)** — "Rocks in. Lithium out. Zero waste." (Rock Zero).
4. **Outcome statement + scientific noun** — "Identifying recurrence risk before cancer spreads" (Droplet).
5. **Contrarian declaration** — "NOVEL SUPERCONDUCTORS THE WORLD ACTUALLY NEEDS" (Quantum Formatics). Implies the field is chasing the wrong thing.
6. **Capability sentence (full plain English)** — "Foray makes it possible to build plant products and seeds from single cells." (Foray).
7. **Mission as headline** — "We generate diverse genomes to promote human, animal, and planetary health." (Anthology). First-person plural + purpose clause.
8. **Bare technology label as hero** — "Technology" (Pascal). Only works when the subhead carries a hard scientific claim.

## Subhead formula

`[Company] + [strong verb: invents / engineers / has developed / harnesses] + [the noun] + [for / required by / to power] + [named markets].`

Examples: Foundation Alloy, Pascal, Robigo all follow this single-sentence form. Cap ~30 words.

## Banned words (effectively absent across all 17 sites)

- revolutionary / revolutionizing
- world-class / best-in-class
- AI-powered (as a hero buzzword — fine as part of an integration list)
- disrupting / disruptive
- cutting-edge
- next-generation / next-gen
- innovative
- transformative
- empowering / enabling (unless paired with a concrete object)
- seamless / robust / powerful
- synergies
- "solutions provider"
- exclamation marks, hype emoji

**Mild offenders that earn it** when paired with concrete mechanism in the next sentence: "transformational" (Copernic), "pioneered" (Droplet), "reinventing" (Rock Zero).

The strongest sites (SiTration, Foundation Alloy, OpenStar) use **zero superlatives** in body copy.

## Copywriting rules to enforce

1. **Every claim has a number or a named source.** "20–40% of crops lost" (Robigo), "$3.4 trillion in mining waste" (SiTration), "10–15 minutes" (Nanopath). No "fast" without a unit; no "large" without a dollar figure.
2. **Name the incumbent and what your tech *removes*.** Foundation Alloy: *"eliminates melting, solidification, and secondary processing."* Frame by subtraction, not addition.
3. **Concede the historical tradeoff, then collapse it.** Foray: *"Human abundance shouldn't have to come at the expense of the natural world. And now it doesn't have to."*
4. **Use "The result:" as a connective** to introduce stacked benefits (Lithios).
5. **Three-beat triplet section headers** — "Stable. Simple. Modular." (OpenStar). The third item should reframe the first two.
6. **Antonym pairs as dual headlines** — "Smaller Volumes / Bigger Impact" (DropGenie).
7. **One-sentence-per-paragraph** for the load-bearing scroll. Robigo and Pascal keep their core narrative to ~5 single-idea paragraphs. No bullet padding.
8. **No sentence starts with "We"** in load-bearing sections (SiTration, Foundation Alloy avoid it almost entirely). Reserve "We" for team bios and mission statements.
9. **Cite peer-reviewed work by full title** — Pascal's *"Colossal barocaloric effects with ultralow hysteresis in two-dimensional metal–halide perovskites."* The title alone establishes the field.
10. **Rhetorical question as subhead when the buyer is under pressure** — Droplet's "Doctor, did you get it all?" is the strongest hook in the entire set.
11. **Hero word cap: 12. Subhead word cap: ~30.** Subheads name the mechanism — don't summarize, *specify*.
12. **No first-person "we" in product-led heroes.** Reserve for mission-led heroes.

## Section orderings (most common to least, for single-page Tough Tech sites)

1. **Hero → Problem (with stat) → Mechanism → Outcome/Benefits → Trust → CTA** (Robigo, Pascal, OpenStar, SiTration). The dominant pattern.
2. **Hero → Logos/partners → Problem → Solution → Tech → Use cases → CTA** (Lithios, DropGenie). Use only if you actually have logos.
3. **Hero → Stats → Body → Product → Signup** (Teragen). Leaner, when stats can carry the page.
4. **Hero → Process (numbered 01/02/03) → Product → Metrics → Quote → Production → News → Contact** (Foundation Alloy). Report-style.

**Universal:** Hero is always first. Contact/footer is always last. Problem usually precedes solution. Team appears before contact when present.

## Trust signals — ranked by frequency at pre-seed stage

1. **Press logos / pull-quotes** (SiTration, OpenStar, Robigo, DropGenie) — most accessible.
2. **University/lab attribution** of the underlying tech (Anvil: Rice; Foray: MIT/Draper).
3. **Government grants** (Robigo: NSF $1.25M; Nanopath: NIH/NSF). Punches above its weight.
4. **Peer-reviewed papers cited by full title** (Pascal, OpenStar). Strongest single-line credibility move.
5. **Named team credentials**: degree + university + prior employer + patent count (Copernic, OpenStar).
6. **Strategic investor or partner callout** (Droplet: NVIDIA; ReynKo: General Oceans).
7. **Trademarked process/product names** (Foundation Alloy: MetalsFIRST™, Molyclast®). Surprisingly powerful proxy for "we have IP."
8. **Cited third-party data sources** (Teragen: Morgan Stanley, EIA, Texas A&M). Substitute when no first-party data exists yet.
9. **Awards** (Robigo: WEF Pioneers; Nanopath: ADLM) — useful but weaker.
10. **Regulatory honesty disclaimers** (Anvil's FDA note) — counterintuitively builds credibility.

**Notable absence:** investor logo strips. None of the 17 use a "Backed by" logo wall on the homepage. Pre-seed sites either have no logos or one named partner inline.

## Visual patterns to enforce in the design prompt

1. **Palette default: white/light background, near-black/navy text, one cool accent (cyan/teal/blue).** 7 of 8 sites in batch B are this. SiTration uses earthy mineral tones (#385156 teal, #630a0d oxblood). The accent should reference the *material/industry*, not "startup."
2. **Sans-serif everywhere; gravitas comes from weight and size, not from serifs.** All 17 sites are sans-serif. None use display serif headlines.
3. **Generous whitespace in hero, dense data in stat sections.** The contrast is the rhythm.
4. **Custom diagrams over stock imagery.** SiTration's Inputs → Outputs flow, Pascal's icon triplet, OpenStar's dipole schematic. **Zero sites use stock photography of "people in lab coats."**
5. **Numbered section labels (01, 02, 03).** Foundation Alloy and Anthology use them. Adds report-like rigor.
6. **Multiplier stats in single-glance strips** — 100x / 40x / 10x (DropGenie); 2x / 4x / 10x (Foundation Alloy); 3 hr / >50 species / 1 copy (Anvil). Three numbers, no qualifiers.
7. **Press/investor logos treated as pull-quotes, not just walls** (SiTration). Quote + source name reads more substantive than a mute logo strip.
8. **3-node horizontal process diagrams** (Anthology's Feedstock → Designer Genome → Products) work harder than paragraphs.
9. **Real product/process photography over render-heavy CGI.** Pre-seed sites with no product yet should use diagrams, not CGI mockups.
10. **No carousels, no auto-playing testimonials, no chatbot widgets.** None of the 17 use them.
11. **Footer minimal**: location, copyright, ~5 links max.

## CTA wording — pre-seed safe set

- "Contact Us" / "Get in touch" / "Reach Out" / "Make Contact"
- "Get early access" / "Register Interest" / "Sign up"
- "How it works" / "Read more" / "Learn more about us"
- "Partner with us" / "Work with us"
- "Meet the team"

**Avoid at pre-seed:** "Buy now," "Start free trial," "Request demo" (unless you have a demo), "Schedule a call" (unless you have a real calendar), "Learn More" (too generic — name what they'll learn).

## Visual patterns to AVOID (the "MVP wireframe" smell)

- Pastel colors, rounded-corner cards everywhere, confetti gradients
- Generic hero illustrations (isometric people working at desks)
- "Learn More" as the only CTA
- Any Lorem Ipsum
- Stock business handshake photos, "scientist looking at iPad" shots, AI-generated abstract blobs
- Carousels of testimonials with placeholder names
- Logo walls with imaginary partners
