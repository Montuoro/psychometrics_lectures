export const SLIDE_COUNT = 20;

export const SLIDE_TITLES = [
  "Title",
  "Where We Left Off",
  "Part 1: Building the Model",
  "The Whole and Its Parts",
  "Turns out we are a lot like potatoes",
  "What Is a Model?",
  "Maximum Likelihood Estimation: Autofocus",
  "MLE Iteration Process in the Rasch Model",
  "Part 2: Discrimination, Reliability, and Validity",
  "Discrimination and the Unit",
  "Forget Everything You've Been Told About Reliability",
  "Fit and Construct Validity",
  "Item Misfit",
  "Sources of Misfit",
  "The Rigidity Is the Point",
  "Part 3: The Mathematics of Nature",
  "The Beetle",
  "Odds, Log-Odds, Probability",
  "Rasch Meets Fisher, Huxley",
  "Thank You",
];

export const NOTES = [
  // Slide 0 — Title
  `"Welcome back. In our first session, we established that measurement requires a unidimensional continuum — items and persons located on the same scale, with equal-interval units. Today we go deeper. We're going to understand what the Rasch model actually DOES — how it builds that continuum from data, how we know when something goes wrong, and what's really happening mathematically under the hood."

Pause. "And you'll notice our progress bar has changed. Instead of a bunny, we have a beetle. Watch it as we go through the lecture. By the end, you'll understand why."

Don't explain the beetle yet. Let it sit there, tiny, at the bottom of the screen.`,

  // Slide 1 — Where We Left Off
  `Quick recap — don't linger here, just re-anchor the audience.

"Last time we established three things." Point to each as you say them:

"First: measurement requires a unidimensional latent trait — a single continuum."

"Second: items and persons both live on that continuum — items by difficulty, persons by ability."

"Third: invariance — the comparison between two persons shouldn't depend on which items we use, and vice versa."

"Today's question is: HOW does the Rasch model actually build that continuum from a matrix of ones and zeros?"`,

  // Section Break — Part 1
  `Just pause here for a beat. Let the title sit. Then advance.`,

  // Slide — The Whole and Its Parts
  `Let the image do the work first. Pause.

"Remember from Session 1 — measuring a latent trait isn't like reading a ruler. It's complex. Many items, each tapping a different part of the same construct."

"Look at this window. Hundreds of pieces. Different shapes, different colours. No single piece tells you what the window is about. But together — when every piece fits — they form something whole. Something greater than any individual fragment."

"That is what items do in an assessment. We assemble many pieces, and from their combined responses, a unidimensional measurement emerges. More complex than physical measurement, but the endpoint is the same: a single scale."

"The Rasch model builds the window. But the pieces must fit. If a piece doesn't belong, the image begins to break down as a cohesive whole."
`,

  // Slide — People Are Potatoes
  `"Rasch saw something that many psychometricians still struggle with. Whether you're weighing potatoes on a scale or measuring numeracy in children, you are fundamentally tapping into a unidimensional phenomenon. The destination is the same — a unidimensional scale."

"But the way we get there is very different. With a ruler or a set of scales, it's direct. With human measurement, the path is tough and complex. It requires a conceptual leap: first, that we ARE moving toward a unidimensional scale — just like physical measurement. And second, that getting there requires a lot of work — complex, hard, conceptually difficult work. Building items, checking fit, testing invariance."

"Rasch understood this. And in 1968 he tried to explain it to a room full of psychologists. He used a simple analogy: weighing potatoes at the market. The reading on the scale must not depend on what else is on the counter, who is standing next to you, or what you bought before. The weight is the weight. Independent of irrelevant context."

"His point: a person's ability estimate should work the same way. It should not depend on which items were on the test or which other people took it. This is specific objectivity. This is invariance. This is human measurement — and this is what we already discussed in Session 1."

Pause for effect.

"During Rasch's lecture in 1968, one psychologist interrupted with a simple statement:"

Deliver with comic timing: "'...but we are not potatoes.'"

"They thought human psychology was too complex, too special, for the same principles. But Rasch was right. The principle of invariant comparison is what makes measurement MEASUREMENT — whether you're weighing potatoes or measuring reading ability. The path is harder with humans. But the destination is the same."

"Now — a small note about where I'm getting all of this. Everything I quote from Rasch in this presentation comes from a single source: an extremely rare recording made in 1978 at the University of Western Australia, when Rasch worked directly with David Andrich — who trained me — for six months. Rasch died only a couple of years later. This recording is real gold, and as far as I know it's one of the only extended interviews he ever gave. So whenever you hear me say 'Rasch said...' — that's where it comes from."`,

  // Slide — What Is a Model?
  `"So if measurement must be independent of irrelevant factors — if we really are like potatoes — how does the Rasch model enforce that?"

Now we get into the mechanics. This slide has two parts: the circularity diagram and the 2PL/3PL contrast.

PART 1 — THE CIRCULARITY

"A lot of people ask me: what is a model? In the Rasch context, it's a genuinely interesting question — because two things are going on. First, Rasch takes the idea of a model as a benchmark really seriously. The model isn't just a statistical convenience — it's the standard against which everything is judged. And second, there's an ingenious circularity to how it works."

Point to the four-step diagram:
"Step 1: We collect response data — persons answering items, ones and zeros."
"Step 2: The Rasch model uses all of that data to build a measurement scale — it estimates where every person and every item sits on the continuum."
"Step 3: But then — and this is the crucial part — the model becomes the criterion. Each individual item's data is checked against the model that itself was built using all person-item interactions."
"Step 4: If an item doesn't conform — if its observed responses don't match what the model predicts — we have a problem. That item isn't measuring the same construct as the others."
"So the model is built from the data, but the data must fit the model. It's circular — and intentionally so."

"And this is exactly where the Rasch model parts company with other models. The two-parameter model adds a discrimination parameter. The three-parameter model adds a guessing parameter. They bend the model to accommodate the data. But the moment you do that, you destroy invariance — the comparison between two persons now depends on which items they faced."

"The Rasch model refuses to bend. Data must fit the model. And that rigidity is the point — it's what preserves the measurement properties we need."

"We'll come back to fit in a moment. First, let's see how the model builds the scale."`,

  // Slide — MLE: Autofocus
  `This is the conceptual slide. The autofocus analogy makes MLE visceral and immediate. Keep it in lay terms.

"Now that we understand what we're building — a unidimensional scale with persons and items — the question is: how does the model find it? The answer is maximum likelihood estimation. And I want to explain it with something everyone has experienced."

"Think about what happens when you press the shutter button halfway on a camera — or when your phone focuses on a face. We take it for granted now, but autofocus is actually a beautiful example of iterative estimation."

"A bit of history: the earliest autofocus systems in the late 1970s and early 1980s — cameras like the Konica C35 AF in 1977 and the original Minolta Maxxum in 1985 — used what's called contrast detection. The principle is simple: the camera moves the lens motor a small amount, then reads the sensor to measure the contrast in the image. An in-focus image has sharp edges — high contrast in the focus area. An out-of-focus image has soft edges — low contrast. So the camera moves the lens, measures contrast, asks 'did it go up or down?', and moves again in whichever direction improved things."

"This is literally hill-climbing. The camera is searching for the peak of a contrast curve. It doesn't know where the peak is in advance — it discovers it by iterating."

Click Unfocused. Let the blurry image sit.

"You're looking through the viewfinder. The scene is right there in front of you — our potato friend, the items around it. But everything is blurry. The image exists. It's real. You just can't see it clearly yet. That's where we start in MLE: the measurement is in the data, but we haven't found it yet."

Click Focus 1. "First adjustment. The lens motor nudges forward. Contrast goes up. The camera knows it's moving in the right direction. Already a bit sharper."

Click Focus 2, 3. "Each time, the adjustment gets smaller. The big corrections happen early — when you're way out of focus, any movement toward the right position makes a dramatic improvement in contrast. But as you approach the peak, the contrast curve flattens out. The gains get subtler. The motor makes finer and finer adjustments."

"This is what early contrast-detection AF cameras did — and if you remember the 1990s, you remember the sound of the lens hunting back and forth, especially in low light. That hunting is the iteration."

Click Focus 4, 5. "Now the adjustments are tiny. We're very close. Fine-tuning."

Click Locked. The bracket turns green.

"Focus locked. The camera has found the sweet spot — the lens position where contrast is maximised. The image is as sharp as it can possibly be."

"Maximum likelihood estimation works in exactly the same way. The 'image' is the measurement — the true position of every person and every item on the scale. It's already in the data, just like the scene is already in front of the lens. The algorithm starts with crude initial estimates, computes what the data should look like given those estimates, compares predicted to observed, and adjusts in whatever direction improves the fit. Over and over, with each adjustment smaller than the last, until it converges."

"That convergence point is the maximum of the likelihood function. It's the peak of the hill. The point of sharpest clarity."

"And I want to be very specific here, because this is the key element in modelling data in the Rasch model. I'm going to say it twice."

"It's the point where the model — specifically the item-difficulty and person-ability estimates — lead to probabilities of correct responses that are as close to reality as mathematically possible."

Pause. Then repeat it slowly:

"The item-difficulty and person-ability estimates lead to probabilities of correct responses that are as close to reality as mathematically possible. That is what maximum likelihood estimation does. That is what the model is."


"Now let me show you what this actually looks like with real numbers."`,

  // Slide — MLE: The Iteration Process
  `This is the full Moulton-style MLE demonstration. Take your time. Each click is one iteration. The audience needs to SEE the numbers settle.

Click Raw Data.

"Here is our response matrix — 9 persons labelled A through I, 10 items. Ones and zeros. On the right you can see the row totals — Person A got 8 correct, Person I got 2. The column totals show how many persons got each item right. Items 1 to 4 were easy. Items 9 and 10 were hard — only 1 correct each."

"The initial ability and difficulty estimates on the right come from the simplest possible transformation: the log of the odds. Take the raw proportion of items a person got correct, divide by the proportion incorrect — that gives you the odds. Then take the natural log. Person A got 8 out of 10, so the proportion is 0.80, the odds are 4:1, and the log-odds is about 1.39. Same logic for items, but reversed."

"These initial logits are very rough. They're just the raw proportions converted to a log scale. They don't account for which specific items a person got right or which specific persons got an item right. They're the blurry starting image. The whole point of the iterative process is to refine these crude starting estimates into precise measurements."

"Before we start iterating, let me explain the four matrices you're about to see."

"Top left: expected values. These are the probabilities of a correct response for every person-item interaction, based on the current person ability and item difficulty estimates. They are literally the model's predictions — what it thinks should happen given where it currently believes each person and item sits on the scale."

"Top right: variance — also known as Fisher information. When the item difficulty is well matched to the person's ability — when P is around 0.5 — the information is high. The response could go either way, so it tells us a lot about where the person actually sits. We can make a confident adjustment. When the item is way too easy or too hard — P near 0 or 1 — the outcome is almost certain, so it tells us very little. We adjust cautiously."

"Bottom left: residuals. These are simply the observed data — the raw zeros and ones — minus the expected values. They tell us where reality differs from the model's predictions, and in which direction."

"Now here's how the iterations work. The algorithm uses the residuals and the variance together. The residuals tell us the direction each estimate needs to move. The variance tells us how far we dare to move it — how much precision we have. Each iteration adjusts every person and item estimate, aiming to reduce the total sum of residuals for each person and each item toward a target of 0.001."

"Watch what happens."

Click through the iterations slowly. As you do:

"With each iteration, the expected values are recalculated based on the updated estimates. The residuals shrink — as a function of the distance from the actual results and the Fisher information. The refinements continue, iteration after iteration, until the total sum of residuals for persons and items reaches the convergence point of 0.001."

"At that point — converged. Every person ability, every item difficulty, is at the point where predictions match observations as closely as possible. These are your measurements — jointly estimated on the same logit scale."`,

  // Section Break — Part 2
  `Pause. Let them settle. "Now we've seen how the model is built. The next question is: how do we know it's working? We'll look at discrimination, reliability, and validity."`,

  // Discrimination: Conceptual
  `This is the first time in our sessions that we're looking at an Item Characteristic Curve — an ICC. Take a moment to introduce it before getting into discrimination.

"Before I talk about discrimination, let me explain what you're looking at. This is called an Item Characteristic Curve — an ICC. It's one of the most important visuals in Rasch measurement."

"This is the MODEL — the simulation — not the observed data. It shows the predicted probability of a correct response for a single item, across all ability levels."

"The x-axis is ability in logits. The y-axis is the probability of getting the item correct. Both curves represent the same item with a difficulty of zero logits — you can see they both cross the 0.5 probability line right at zero on the x-axis. That's what item difficulty means: the point where a person has a 50-50 chance."

"As you move to the right — higher ability — the probability of success increases. As you move to the left — lower ability — it decreases. That S-shaped curve is the Rasch model's prediction for how this item behaves."

"Now — the two curves show the SAME item difficulty but with DIFFERENT levels of discrimination. And that's what I want to talk about."

"What is discrimination? In the Rasch model, it has a very specific meaning. Discrimination is the rate of change in the probability of a correct response as ability increases."

Point to the green ICC. "Look at this steep curve. As ability increases, the probability of a correct response rises sharply. A small difference in ability — say, half a logit — makes a big difference in the outcome. This is high discrimination."

Point to the red ICC. "Now look at this flatter curve. The probability changes more gradually with ability. A person well above the item difficulty still doesn't have a dramatically higher chance of success than someone near the difficulty. This is low discrimination."

"Now here's the insight that most textbooks don't make explicit." Pause.

"Discrimination determines the UNIT OF MEASUREMENT. Think about what a unit means. In physical measurement, a centimetre is a centimetre — it's the same size everywhere on the ruler. In Rasch measurement, the logit is the unit. And the size of that unit is determined by how steeply the probability changes with ability — that's discrimination."

"A high-discriminating item measures in a SMALL unit — like millimetres. Precise. A low-discriminating item measures in a LARGE unit — like inches. Less precise. If your items have different levels of discrimination, they are measuring in different units. That's like having a ruler where some centimetres are bigger than others. You can't get a coherent measurement from that."

"This is why the Rasch model requires uniform discrimination. It's not a limitation — it's a requirement for consistent measurement. One unit. One scale."

"Think of it like a thirty-centimetre ruler where some centimetres are literally stretchier than others. Some are two millimetres wide, some are two centimetres wide. You'd never trust a measurement from that ruler. That's what happens when items have different discrimination — some measure in tiny precise units, others in big sloppy ones. The Rasch model says: all items must measure in the same unit. That's the rigidity."

Now transition to the bottom box — the link to reliability.

"And here's why this matters beyond just fit. Discrimination feeds directly into reliability."

Point to the bottom box.

"When items have high discrimination — steep gradients — they can detect fine differences between people. Person A at 1.2 logits and Person B at 1.5 logits will get measurably different patterns of responses. Their estimates pull apart. The person separation index goes up. Reliability goes up."

"But when items have low discrimination — flat gradients — even people with genuinely different abilities get similar patterns. Their estimates get mushed together. The scores overlap. You can't tell them apart. The person separation index drops. Reliability drops."

"So discrimination isn't just about individual items — it drives the entire reliability of the measurement. High discrimination means clear separation. Low discrimination means everything goes mushy."

Now point to the C. diff images and rulers at the bottom.

"Here are three C. diff bacteria — genuinely different lengths. Measure them with a millimetre ruler and they all round to zero. No separation. Measure them in micrometres and A, B, C sit at distinct points. The unit determines whether you can see the differences."

"That's exactly what discrimination does. High discrimination gives you a fine-grained unit — persons separate clearly. Low discrimination gives you a coarse unit — persons get mushed together. And that feeds directly into reliability, which we'll look at next."`,

  // Reliability
  `"We've just seen that high discrimination gives us a precise unit of measurement. Now — what does that mean for reliability?"

"Most people will tell you reliability means repeatability — if we gave the test again, would we get the same result? That's putting the cart before the horse."

"Here's what reliability actually is. Look at the equation — the person separation index. It's the variance of the ability estimates minus the error, divided by the variance. Signal minus noise, divided by signal. How much of the spread in our estimates is real, and how much is measurement error?"

"When items have high discrimination and are well targeted to the people taking the test, the probability of a correct response moves swiftly with small changes in ability. Item difficulties also match the range of person abilities. We end up with good separation between persons, low error, and overall a nice spread of the estimates. This is high reliability."

"And yes, as a consequence, those results will be repeatable. But the repeatability is the consequence — not the thing itself. The thing itself is person separation."

"That's why the traditional definition puts the cart before the horse. Repeatability follows from good separation, good targeting, and high discrimination. It doesn't define reliability — it's the outcome of it."`,

  // Slide — Fit and Construct Validity
  `"The Rasch model is what I call a validity machine. What we're doing here is moving from reliability — which is a form of discrimination and targeting — to determining whether we measure in each item what we think we're measuring. We're going back to Kelley in the 1920s here."

"The Rasch model establishes a model — a simulation — so we can examine whether items operate in unison, reflecting the overall model. That examination is fit, and fit is the quantitative heart of construct validity."

"So — how do we check fit?"

Point to the ICC with class interval proportions overlaid.

"Here's an item characteristic curve — the S-shaped curve from the model's simulation. And overlaid are the actual observed proportions from groups of persons at different ability levels."

"When the dots sit close to the curve, the item fits — it's operating consistently with the other items in reflecting the construct."

"When they deviate systematically — misfit — the item isn't measuring what the others are measuring. That's a validity problem."`,

  // Slide 6 — Item Misfit
  `"There are two key patterns of misfit to watch for."

Point to the left panel:

"First: LOW DISCRIMINATION. The observed proportions are flatter than the ICC. The item doesn't distinguish well between persons of different ability. It's noisy — it's adding measurement error rather than measurement information. As we discussed, this means the item is measuring in a larger, less precise unit than the other items."

Point to the right panel:

"Second: HIGH DISCRIMINATION. The observed proportions are steeper than the ICC. The item discriminates MORE than the model expects. In traditional test theory, you might celebrate this. In Rasch measurement, it's a concern — because it means this item is measuring in a DIFFERENT unit from the others. It may also indicate local dependence or some other violation of the model's assumptions."

"In both cases, the ICC — the model's prediction — serves as the criterion. The theoretical curve is what we expect. The observed proportions are what we got. Misfit is the gap between them."`,

  // Slide 7 — Sources of Misfit
  `"What CAUSES misfit? There are several common sources, each of which we'll explore in future lectures. But let me flag them now."

Point to each as you name it:

"LOCAL DEPENDENCE. Getting item 3 right BECAUSE you got item 2 right — not because of your ability. The items are linked to each other, not just to the latent trait. This violates the Rasch model's assumption that responses are independent given ability."

"MULTIDIMENSIONALITY. The item taps a second trait — not just the one being measured. If a maths word problem requires advanced reading, it's measuring two things at once. That creates misfit."

"GUESSING. Correct responses not driven by ability. On a multiple-choice test, a person with zero knowledge can guess correctly 25% of the time. Those responses aren't measurement — they're noise."

"Each of these is a story for a future session. The key point for today is that the Rasch model's rigidity — its refusal to accommodate these phenomena with extra parameters — is what allows us to DETECT them."`,

  // Slide — The Rigidity Is the Point
  `This is a philosophical slide. Deliver it with conviction.

"Other models — the two-parameter model, the three-parameter model — they accommodate misfit. They add a discrimination parameter. They add a guessing parameter. They bend the model to fit the data."

"The Rasch model refuses to do this. And that refusal is not a limitation — it is the POINT."

Pause for emphasis.

"Remember what we established in Session 1: measurement requires invariance. The comparison between two persons must be independent of which items are used. The comparison between two items must be independent of which persons are tested."

"The moment you add a discrimination parameter, you destroy that invariance. The comparison between two persons now depends on WHICH items they faced — because different items discriminate differently."

"So the Rasch model's rigidity is what preserves the measurement properties. Fit analysis tells you whether your data actually achieve those properties. Misfit tells you where they don't."

"As Georg Rasch himself put it in 1978: 'I tried to make the data tell me what they were about, and not I should tell the data how they should behave. That's what statisticians usually do.'"

Let the quote sit on screen.`,

  // Section Break — Part 3
  `Change the energy here. Shift from the technical to the philosophical.

"We've built the model. We've checked that it works. Now I want to show you something beautiful — what's actually happening mathematically, and why it connects to nature itself."`,

  // Slide — The Beetle
  `This is the transition to Part 3 — the payoff. Change the tone to something more wondering, more exploratory.

"Now I want to show you something beautiful."

Pause. Let the Melbourne Museum image fill the screen.

"This display stopped me in my tracks at the Melbourne Museum. Dung beetles and stag beetles, arranged in spirals by size — each one larger than the last. It's the visual signature of exponential growth."

"Look at the beetles at the small end. Tiny. Now look at the ones at the top. Enormous. The absolute size increments get larger and larger and larger. That's exponential growth — each step is bigger than the last."

"But here's the key: the relative growth — each increment as a proportion of the current size — is constant. The beetle doubles, then doubles again, then doubles again. The ratio is the same every time."

"Absolute growth: exponential. Relative growth: linear."

Pause. "This is exactly what the Rasch model is."

Now refer to the Rasch quote below the image.

"During his year with Fisher in London, Rasch analysed crab shell data — growth segments plotted on a log scale that followed straight lines from a centre of growth. This was close to individual-level growth data, not just population statistics. When he showed it to Huxley, Huxley was struck — his own work on allometric growth had been about populations. But Rasch's data was approaching how the individual organism grows."

"That's what Rasch means in this quote. He took from that encounter a conviction that measurement must deal with individuals — not population distributions. And that conviction carried all the way through to the model we use today."`,

  // Slide 10 — Odds, Log-Odds, Probability
  `"Let me show you three ways of looking at the same thing — and why it matters."

Point to the left panel. "Odds. Just like in biology — as we'll see in a moment with E. coli growth — when ability increases, it increases exponentially. Think about synapses. As connections are laid down in the brain, each new connection builds on the ones before. The growth is by orders of magnitude. More able means exponentially more able. More difficult means exponentially more difficult. That's what the odds scale shows."

Point to the centre panel. "Log-odds — logits. This is simply a friendly way of looking at that exponential growth. Take the natural log and the exponential becomes a straight line. Equal intervals. Interpretable. This is where measurement lives — on an interval-level scale. The logit scale is how we make exponential growth usable."

Point to the right panel. "Probability. This is where person meets item. The probability of a correct response — bounded between 0 and 1. It's a function of both person ability and item difficulty."

"Growth in reality is exponential. Logits are the friendly way of placing it on a scale so we can interpret it. And probability is what we actually observe when a person interacts with an item."

"So odds and log-odds are what the thing IS — for persons, for items. Whether we look at it in the realistic view of exponential growth, which is odds, or in the measurement view, which is log-odds — linear, interpretable, equal-interval. But ultimately, probability is what we are viewing in reality. In the natural world, the probability would be the probability of successful growth — given, for example, that the animal might be eaten or predated. In ability testing, it's whether the kid is going to get the answer right or wrong."`,

  // Slide — Rasch Meets Fisher, Huxley
  `This is the closing slide before questions. Let the E. coli GIF run — the audience is watching exponential growth happen in real time while you speak. Keep it slow and let it land.

Point to the GIF. "What you're watching is E. coli — a colony of bacteria growing on a microscope slide. This is exponential growth. Real, biological, observable."

"The Rasch model's exponential structure isn't arbitrary mathematics. It reflects how biological systems actually develop. Organisms grow exponentially. Brains build synaptic connections exponentially. The model works because it mirrors nature."

"Georg Rasch knew this. In 1935, he spent a year in London with Ronald Fisher. During that time he analysed crab shell data and found that growth segments followed precise straight lines on a log scale. He showed this to Julian Huxley — the biologist who had written the foundational work on exponential growth in biology."

Read the quote on screen: "'I showed this to Julian Huxley, and he was completely flabbergasted.'"

"Huxley realised his own work had been about populations. But Rasch's data was close to showing how the individual grows. And Rasch took that insight and ran with it — all the way to the model we've been studying today."

Pause. Let the statement sit.

"Measurement must deal with the individual. The exponential is nature's way of doing that. And the Rasch model is the formalisation of that principle."`,

  // The End
  `Hold for questions. Let the slide sit.`,
];
