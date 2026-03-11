export const SLIDE_COUNT = 10;

export const SLIDE_TITLES = [
  "The Hook",
  "Counting vs. Measuring",
  "The Education Problem",
  "Latent Trait",
  "The Guttman Structure",
  "Invariance",
  "Why Invariance Is Possible",
  "From Ordering to Measurement",
  "Order, Probability, and Misfit",
  "Back to the Student's Question",
];

export const NOTES = [
  `Start here and pause. Let the question sit in silence for a few seconds before you say anything. Then: "In the last session, Shiraj Shamshir asked the following question about computer adaptive testing \u2014 and it stopped me in my tracks. Because this question cuts right to the heart of psychometrics and validity. If one student consistently receives easier questions and another receives harder questions, how are their final scores fairly compared? Would it be measured with the weighting of the questions?"

Pause again. "By the end of this lecture, you will be able to answer this question. And the answer is more profound than you might expect \u2014 because it forces us to confront what measurement actually IS."

Don't answer the question yet. Let it hang. Everything that follows builds toward the answer.`,

  `This is the foundation of everything. Start by pointing to the rocks: "Imagine I have a bucket of 30 rocks. Different sizes, different masses. I count them: 30. I have a number. But what does that number tell me about mass? Nothing. Absolutely nothing. Five large rocks might weigh 500 grams. Thirty tiny pebbles might weigh 200 grams. The count of 30 tells me nothing about the magnitude I actually care about \u2014 mass."

Now point to the scale: "But when I put those rocks on a weighing scale, I get 642 grams. THAT is a measurement. Why? Because it's expressed relative to a UNIT \u2014 the gram. The gram is a unit of the quantity of mass."

Now pause and deliver the key line slowly and deliberately: "Counting stuff does not result in a magnitude. Therefore, counting stuff does not result in true measurement."

Let that land. Then explain the term magnitude: "What do I mean by magnitude? A magnitude is a position on a continuum, expressed in equal-interval units. When I say 642 grams, that's a magnitude \u2014 it tells me exactly where on the continuum of mass this object sits. And crucially, the units are equal-interval: the difference between 100g and 200g is the same as the difference between 500g and 600g. That's what makes it a true measurement. As Roche discusses in The Mathematics of Measurement, without equal-interval units you don't have a magnitude \u2014 you just have an ordering. And when we count 30 rocks, we haven't established any position on a continuum. We've just counted objects."

If the audience is engaged, you can add the formal definition: "More precisely, magnitudes have three key properties. First, they're ordered \u2014 one magnitude is greater or less than another. Second, they're additive \u2014 put a 200g weight and a 300g weight together and you get 500g. Third, they can be expressed as ratios relative to a unit. Roche, in The Mathematics of Measurement (1998), defines measurement as the estimation of the ratio of a magnitude to a unit of the same kind. So 642g means the magnitude of mass is 642 times the unit gram. The measurement IS that ratio."

Then: "This distinction \u2014 between counting objects and measuring a magnitude relative to a unit \u2014 is the single most important idea in this entire lecture. Everything else follows from it."`,

  `Now bridge directly to education: "A student takes a test. Gets 15 items correct out of 30. The teacher writes 15/30 on the paper. But I want to ask you: is that a measurement of ability? Or is it just a count of correct responses?"

Pause. Let them think.

"If we're just counting correct items, we face exactly the same problem as counting rocks. The count tells us nothing about what it's supposed to measure \u2014 the student's actual ability \u2014 without understanding the unit."

Now bring in the CAT connection: "And here's where it gets really pointed. In computer adaptive testing, different students answer completely different items. Student A might get 15 out of 30 relatively easy items. Student B might get 15 out of 30 much harder items. Does 15/30 mean the same thing? Obviously not. So how can we fairly compare them? We can't \u2014 unless we have something more than a count. We need a measurement. And a measurement requires a unit."`,

  `Start by bridging from the previous slide: "We've just established that counting is not measuring \u2014 that measurement requires a magnitude expressed in equal-interval units. With the rocks, what we measured was MASS. Mass is the quantity. The gram is the unit. 642 grams is the magnitude. Now \u2014 in education, what is our equivalent of mass? The answer is: ABILITY."

Pause and let that connection land. "Ability is a phenomenon \u2014 just like mass, or gravity, or ambient temperature, or radiation. It is a phenomenon whose magnitude we express by defining units, and then measure. The process is the same. The challenge is that ability is far harder to grasp."

Point to the brain image: "This is from the MICrONS project, published in Nature in April 2025 by Miryam Naddaf. It shows a 3D map of just one cubic millimetre of mouse brain \u2014 84,000 neurons connected by 524 million synapses, with four kilometres of axons. Over 150 researchers from 22 institutions spent years producing this, the most detailed wiring diagram of a mammalian brain ever created."

"When we measure mass, we can feel it. We can hold a rock and sense its heaviness. We can put it on a scale. Mass is physical, tangible, directly observable. But ability? Ability lives inside the mind. Somewhere in that extraordinary complexity is what we call a LATENT TRAIT. Latent meaning hidden. You cannot open up someone's head and see it. You cannot touch it. You cannot weigh it. Even fMRI studies \u2014 where people perform tasks inside brain scanners \u2014 have shown extraordinarily poor ability to differentiate between people of different ability levels."

Pause. "And this requires a genuine stretch of the imagination to accept this phenomenon of the latent trait. We are asking you to accept that inside the mind there exists something \u2014 this ephemeral, invisible, almost ectoplasmic thing called a latent trait \u2014 that behaves like a quantity. That it has magnitude. That it sits on a continuum. That it can, in principle, be measured in units. That is a big conceptual leap. And it's one that many people struggle with, because we are so used to measurement meaning something physical."

"Consider this: fMRI studies have tried to get closer \u2014 putting people in brain scanners, giving them tasks, and looking at patterns of neural activation to try to differentiate between people of different ability levels. The results are remarkably poor. Brain imaging can barely tell apart a person of high ability from a person of low ability. **And yet a well-constructed Rasch analysis of test responses \u2014 based purely on the pattern of correct and incorrect answers \u2014 can tell us more about the difference between two students' abilities than a multi-million-dollar brain scanner. THAT is the power of psychometrics.**"

"So if we can't see the latent trait directly, how do we know it's there? Through its MANIFESTATIONS. A manifestation is what happens when a latent trait interacts with a task. A correct answer, a written response, a failed problem \u2014 these are all manifestations. The manifestation is evidence of the trait, but it is NOT the trait itself. The manifestations are as close as we can ever get to the latent trait."

Now address the common objection: "People often say that human measurement simply can't be done. And indeed, it can't be done in the deterministic way that we measure in the physical sciences. But even in the physical sciences, much of measurement is INDIRECT. Think of a mercury-and-glass thermometer. You are not measuring temperature directly. You are measuring the EFFECT of temperature on the mercury \u2014 the expansion of the mercury column. You read the height of the column, and from that you infer the temperature. You are measuring a manifestation of the thing, not the thing itself."

"This is EXACTLY what we do in education. We don't measure ability directly \u2014 we can't. But we measure its effect on performance. A student's pattern of correct and incorrect responses is the equivalent of the mercury expanding in the glass. So the indirect measurement of latent traits is not some exotic, questionable enterprise \u2014 it follows the same logic as one of the most familiar instruments in all of science."

Now point to the ability continuum: "Ability exists on a continuum from lower to higher. Our job is to figure out WHERE on this continuum a student sits. That is what measurement means in education."

Pause. "This is what Piaget understood intuitively, long before modern psychometrics. He talked about cognitive stages appearing in a fixed order of succession \u2014 each one necessary for the formation of the following one. Development is cumulative. That cumulative structure is inherently quantitative \u2014 and it's exactly what we're trying to measure."`,

  `"Now \u2014 how do we get from observable performances to evidence of an underlying ability? The answer is: we look for ORDER in the data."

Click SLOW to start the animation. As each person appears: "Watch what happens as we add person after person. Person 1 has very low ability \u2014 they get just one item correct, the very easiest. Person 2 also gets one correct. Person 3 is slightly more able \u2014 they get the two easiest items correct. And so on, all the way up to Person 40, who gets every single item correct \u2014 a perfect score."

Keep watching as the pattern builds. "Notice the pattern. As ability increases, students answer more and more items correctly \u2014 and critically, they answer them in ORDER. They get the easy items right first, then progressively harder items. A student who gets Item 10 right has almost always gotten Items 1 through 9 right as well."

After the animation completes: "This ordered structure is called the GUTTMAN structure, after Louis Guttman. Guttman was an Israeli mathematician and social scientist who, in the 1940s and 50s, was trying to solve a fundamental problem: how do you know whether a set of items actually forms a single dimension? He developed scalogram analysis \u2014 a method for checking whether responses to a set of items fall into this cumulative, ordered pattern. If they do, you have evidence that the items tap into a single underlying continuum. Piaget\u2019s theory of cognitive development follows exactly this logic \u2014 each stage must be mastered before the next can emerge, creating a natural cumulative order. It represents a key characteristic of ordering when there is an underlying continuum \u2014 the ordering is CUMULATIVE. A student with a higher total than another is classified above all the thresholds that the other student is classified above, plus additional ones. Notice that Person 1 doesn\u2019t get everything wrong \u2014 they still get the easiest item right. Extreme zero scores give us no pattern to work with. Person 40, however, gets a perfect score."

Now the critical point: "This is what I'm showing you in deterministic form \u2014 perfect order. In reality, human measurement is probabilistic, not deterministic. We'll come to that. But the principle is this: when performances show this kind of cumulative order, we have evidence that something real \u2014 an underlying ability on a continuum \u2014 is manifesting in the data. Without this order, we're just counting. With it, we have the foundation for measurement. **And here is the deeper point: the fact that persons AND items can be ordered together on the same continuum is itself evidence that the items are measuring something cumulative, progressive, and coherent in the mind. The ordering is not arbitrary \u2014 it reflects an underlying structure where mastering one level is prerequisite to mastering the next. That is what makes this a continuum, not just a collection of tasks.**"`,

  `"Now we come to the most important principle in all of measurement theory. It\u2019s called INVARIANCE."

Click 'All 20 Items': "Person A and Person B, measured on all 20 items. A is 3.0 units above B."

Click 'Odd Items Only': "Now just the odd-numbered items \u2014 spread across the full difficulty range. The positions shift slightly, but the difference? Still 3.0 units."

Click 'Even Items Only': "Even items only \u2014 completely different set, same spread. Positions shift again. Difference? Still 3.0."

Pause. "Individual estimates move a little with different items \u2014 that\u2019s expected. But the comparison stays the same. That is invariance."

"Now \u2014 why odd and even, not easy half and hard half? Because if I split by difficulty, one person scores everything correct on the easy set and the other scores zero on the hard set. Extreme scores are indeterminate \u2014 you can\u2019t place them on the continuum. Invariance requires both persons to produce non-extreme responses. The items must span the range where both persons sit."

"Bond demonstrated this empirically with his Logical Operations Test \u2014 the BLOT. He split students into high-scorers and low-scorers, calibrated item difficulties separately for each group, and plotted them against each other. Near-perfect agreement. The item hierarchy was virtually identical regardless of which students calibrated it. That\u2019s in the invariance chapter of Bond and Fox\u2019s Applying the Rasch Model."

Read the Rasch quote slowly. Then: "This isn\u2019t just a nice mathematical property. It\u2019s the REQUIREMENT for measurement. If you weigh two objects on Scale A and X is heavier, then on Scale B and Y is heavier \u2014 one of the scales is broken. We require that comparisons are independent of the instrument. Rasch showed this applies to educational measurement. His model embodies it formally."`,

  `"So we\u2019ve seen invariance in action. But WHY is it possible? What makes it work?"

Point to the left: "If I weigh a pile of rocks on two completely different scales \u2014 different manufacturers, different mechanisms \u2014 I get the same result. Why? Because both scales tap into the same underlying phenomenon: mass. The phenomenon is the same. The instruments are different. That\u2019s why the comparison is stable."

Point to the right: "Now apply that logic to education. If I measure two students using two completely different sets of items, and the comparison comes out the same \u2014 it\u2019s because those items are tapping into the same underlying latent trait. The trait is the same. The items are different. That\u2019s invariance."

"And it works both ways. When we compare items \u2014 estimating which is harder and which is easier \u2014 using different groups of students, we get the same item hierarchy. Why? Because those different students are all manifesting the same underlying phenomenon. The latent trait in the mind is what makes the item comparison stable, just as mass is what makes the scale comparison stable."

Key point: "This is the deep insight. Invariance isn\u2019t just made possible by the items measuring the same trait. Invariance IS the items measuring the same trait. They are the same thing. When comparisons hold across different subsets of items, that\u2019s not a consequence of tapping the same phenomenon \u2014 it\u2019s what tapping the same phenomenon MEANS."`,

  `Point to the left: "Guttman gave us ordering. Person A is above Person B. But that\u2019s all \u2014 no units, no way to say by how much. Foundational, but not sufficient for measurement."

Point to the right and the equation: "Rasch built on that ordered structure by introducing a unit \u2014 the logit, short for log-odds unit. Look at the equation. \u03B2 is person ability, \u03B4 is item difficulty. The model says: the log-odds of success \u2014 ln(P/Q) \u2014 equals \u03B2 minus \u03B4. That\u2019s the whole model. The logit is the unit of that log-odds scale \u2014 an equal-interval unit on the ability continuum. Probability is the OUTPUT \u2014 e to the power of \u03B2 minus \u03B4, divided by 1 plus e to the power of \u03B2 minus \u03B4. Once you know the difference in logits between person ability and item difficulty, you can derive the probability of success. But the measurement lives in log-odds, not in probabilities. Now we don\u2019t just know A is above B \u2014 we know A is 2.3 logits above B."

"Bond demonstrated this with the BLOT \u2014 an arbitrary split of students, same item calibrations. CAT does the same thing by design. It selects the most informative items for each student\u2019s ability level. Different items, but every one calibrated on the same scale, in the same unit. The comparisons are fair because the unit is the same."

Pause. "Guttman gave us ordering. Rasch gave us units. CAT is invariance in action."

If the audience is engaged: "There\u2019s a philosophical distinction worth noting. The REPRESENTATIONAL tradition \u2014 Stevens, and formally Krantz, Luce, Suppes and Tversky \u2014 says that numbers are assigned to empirical entities to represent observed relations. It\u2019s permissive \u2014 ordinal scales count as measurement. That aligns with Guttman\u2019s ordering. The CLASSICAL tradition \u2014 articulated by Joel Michell at the University of Sydney \u2014 says something fundamentally different: numbers are discovered as relations between empirical entities. Measurement is the estimation of the ratio of a magnitude to a unit of the same kind. That\u2019s how measurement has always been defined in the physical sciences. The Rasch model is compatible with this classical definition because it requires the data to satisfy specific properties: additivity (combining magnitudes produces a third \u2014 2 logits plus 1 gives 3), cancellation (if A beats B on one item and B beats C on another, A must beat C \u2014 the ordering can\u2019t be contradicted by rearranging items), and sufficiency (the total score contains all the information about ability \u2014 same total, same measure, regardless of which items were correct). As Humphry and Andrich showed in 2008, the unit is implicit within the Rasch model parameters \u2014 it determines the factor of separation between measurements, just as the gram determines the factor of separation between measurements of mass."`,

  `Start with the Deterministic button active: "Here's our perfect deterministic Guttman pattern again. Beautiful order. Every person answers correctly all items below their ability and incorrectly all items above."

Now click Probabilistic Noise: "But human measurement isn't deterministic. This is what real data looks like. The overall pattern holds \u2014 higher ability students still tend to get more items right, and they still tend to get the easier items right first. But there's natural variation. A bright student has a bad day on an easy item. A weaker student guesses correctly on a hard one. The pattern is PROBABILISTIC. And this is not a problem \u2014 this is what the Rasch model is designed for. The model is a probabilistic model precisely because human performance IS probabilistic."

Now click Misfit: "But look at THIS. Look at Item 10, highlighted in red. Something strange is happening. Low-ability students are getting it RIGHT. High-ability students are getting it WRONG. This item is not behaving like the others. It doesn't fit the expected pattern."

Pause. "This is MISFIT. And misfit is incredibly important because it's DIAGNOSTIC. It tells us something is wrong with this item. Maybe it's ambiguously worded. Maybe it's measuring something different from the other items \u2014 a different dimension of ability. Maybe it's a trick question. Whatever the reason, this item doesn't belong on the same continuum as the others."

"But here\u2019s what really matters. When an item misfits, what breaks down is something fundamental \u2014 the assumption that we are measuring what we think we\u2019re measuring. The other items behave consistently with each other. They form a pattern. They tap into the same underlying trait. But this item? It behaves differently. It\u2019s not part of that pattern. And if it\u2019s not part of the pattern, it\u2019s not measuring the same thing. This takes us all the way back to Truman Lee Kelley in the 1920s \u2014 a psychometrician at Harvard and Stanford who formally articulated the concept of test validity in 1927, arguing that a test is valid only to the extent that it measures what it claims to measure \u2014 and the concept of validity \u2014 are we actually measuring what we claim to be measuring? Misfit is a direct, empirical signal that for at least this item, the answer is no."

You can briefly mention: "Misfit can reveal other problems too \u2014 like local dependence, where two items are so related that answering one determines the answer to the other. Or multidimensionality, where the test is actually measuring more than one underlying ability. These are all violations of the measurement requirements, and they\u2019re all revealed by examining the pattern of responses."`,

  `Pause before speaking. "Let's go back to where we started. Shiraj asked: if one student receives easier questions and another receives harder questions, how are their final scores fairly compared?"

Now, with confidence: "Now we can answer."

Go through each point slowly: "Because of INVARIANCE \u2014 the comparison between two students doesn't depend on which particular items were used. Because of THE UNIT \u2014 measurements on a common scale, in a common unit, are directly comparable regardless of which items produced them. Because we're measuring ON A CONTINUUM \u2014 we're not just counting correct answers. We're estimating locations on a developmental continuum where ability and item difficulty coexist."

Pause. "This is what Guttman made possible \u2014 the ordering. And what Rasch made possible \u2014 the unit. And it\u2019s important to recognise that this is fundamentally different from Classical Test Theory. Many people still use CTT \u2014 where your observed score equals a true score plus error, X = T + E. But CTT treats the total score as the measurement. It can\u2019t separate ability from difficulty \u2014 they\u2019re confounded. Give an easy test, everyone looks smart. Give a hard test, everyone looks weak. There\u2019s no invariance. It\u2019s Modern Test Theory \u2014 and specifically the Rasch model \u2014 that provides the unit, that separates person ability from item difficulty, and that gives us invariant measurement. That\u2019s what makes fair comparison possible."

Final statement, slowly: "Different items. Same unit. Fair comparison. THAT is the power of modern measurement theory. That is what psychometrics makes possible."

If time permits, you can add: "And this is why psychometrics matters \u2014 not just as a technical exercise, but as the foundation of fairness in education. Every time a child sits an adaptive test, every time we compare results across different assessments, every time we make decisions about learning based on test scores \u2014 the validity of those decisions rests on these principles. On invariance. On the unit. On measurement, not counting."`,
];
