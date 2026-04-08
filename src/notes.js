export const SLIDE_COUNT = 21;

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
  "Three Views of the Same Thing",
  "Why Logits Are the Scale",
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
  `Let the image do the initial work. Pause and let them look at it.

"Look at this window. Hundreds of pieces. Different shapes, different colours, different sizes. No single piece tells you what the window is about. But together — when every piece fits with its neighbours — they form something whole. Something greater than any individual fragment."

"That is what items do in an assessment."

"Each item taps the same latent trait. Each item is a different shape — different content, different format, different level of demand. But they must FIT TOGETHER. When they do, a unidimensional measurement emerges from their combination."

"Now, this is more complex than measuring length with a ruler. When you measure length, you lay the ruler alongside the object and read the mark. It's direct. It's simple. But when we measure something like reading ability, or mathematical reasoning, or psychological wellbeing — we can't do that. There's no ruler to lay alongside someone's brain."

"Instead, we assemble many items — many pieces of glass — and from the pattern of responses across all of them, a measurement emerges. It's more complex, but the endpoint is the same: a unidimensional scale. A single continuum on which persons and items are located."

"The Rasch model is the framework that takes those fragments and builds the window. But the pieces must fit. If a piece doesn't belong — if an item isn't measuring the same construct — the image breaks. We'll see how we detect that when we talk about fit."

Point to the key insight box: "The whole is greater than — and is formed by — the sum of its parts. But the parts must fit together. That's the fundamental requirement."`,

  // Slide — We Are Not Potatoes
  `This is the potato story slide. The image does most of the work — let it land visually before you speak.

Pause and let them read the image. Then tell the story:

"In 1968, Georg Rasch was invited to give a talk to a room full of psychologists. He wanted to explain a principle he considered fundamental to measurement — that measurement must be, in his words, 'independent of irrelevant factors.'"

"He chose a very simple analogy. He said: imagine you go to the market to buy potatoes. The shopkeeper places them on the scale. The reading on that scale must not depend on what else is sitting on the counter, what you bought five minutes ago, or who is standing next to you in the queue. The weight is the weight. It is independent of irrelevant context."

"His point was profound: a person's ability estimate should work the same way. It shouldn't depend on which particular items happened to be on the test, or which other people happened to take it at the same time. That is what he called specific objectivity. That is measurement."

Pause for effect.

"The psychologists listened politely. And when he finished, there was silence. Then one person in the audience responded — and this was the ONLY response. They said:"

Deliver with comic timing: "'...but we are not potatoes.'"

Let the audience react. Then deliver the punchline:

"They meant that human psychology is too complex, too nuanced, too SPECIAL to be governed by the same measurement principles as weighing vegetables at market."

Point to the punchline on screen: "But when it comes to the PRINCIPLES of measurement — invariance, independence, objectivity — we kind of ARE like potatoes. The weight of a potato must be independent of what else is on the scale. The ability of a person must be independent of what else is on the test. The principle is identical."`,

  // Slide — What Is a Model?
  `Now we get into the mechanics. This slide has two parts: the circularity diagram and the 2PL/3PL contrast.

PART 1 — THE CIRCULARITY

"A lot of people ask me: what IS a model? And in the Rasch context, it's a genuinely interesting question — because there's a circularity to it."

Point to the four-step diagram:

"Step 1: We collect response data — persons answering items, ones and zeros."

"Step 2: The Rasch model uses ALL of that data to build a measurement scale — it estimates where every person and every item sits on the continuum."

"Step 3: But then — and this is the crucial part — the model becomes the CRITERION. Each individual item's data is checked against the model that was built from all items together."

"Step 4: If an item doesn't conform — if its observed responses don't match what the model predicts — we have a problem. That item isn't measuring the same construct as the others."

"So the model is built FROM the data, but the data must FIT the model. It's circular — and intentionally so."

PART 2 — 2PL/3PL CONTRAST

Now point to the two comparison boxes.

"And this is exactly where the Rasch model parts company with other models. The two-parameter model adds a discrimination parameter. The three-parameter model adds a guessing parameter. They bend the model to accommodate the data. But the moment you do that, you destroy invariance — the comparison between two persons now depends on WHICH items they faced."

"The Rasch model refuses to bend. Data must fit the model. And that rigidity is the point — it's what preserves the measurement properties we need."

"We'll come back to fit in a moment. First, let's see HOW the model builds the scale."`,

  // Slide — MLE: Autofocus
  `This is the conceptual slide. The autofocus analogy makes MLE visceral and immediate. Keep it in lay terms.

"Now that we understand what we're building — a unidimensional scale with persons and items — the question is: HOW does the model find it? The answer is Maximum Likelihood Estimation. And I want to explain it with something everyone has experienced."

"Think about what happens when you press the shutter button halfway on a camera — or when your phone focuses on a face. We take it for granted now, but autofocus is actually a beautiful example of iterative estimation."

"A bit of history: the earliest autofocus systems in the late 1970s and early 1980s — cameras like the Konica C35 AF in 1977 and the original Minolta Maxxum in 1985 — used what's called contrast detection. The principle is simple: the camera moves the lens motor a small amount, then reads the sensor to measure the contrast in the image. An in-focus image has sharp edges — high contrast between light and dark pixels. An out-of-focus image has soft edges — low contrast. So the camera moves the lens, measures contrast, asks 'did it go up or down?', and moves again in whichever direction improved things."

"This is literally hill-climbing. The camera is searching for the peak of a contrast curve. It doesn't know where the peak is in advance — it discovers it by iterating."

Click Unfocused. Let the blurry image sit.

"You're looking through the viewfinder. The scene is right there in front of you — our potato friend, the items around it. But everything is blurry. The image EXISTS. It's real. You just can't see it clearly yet. That's where we start in MLE: the measurement is in the data, but we haven't found it yet."

Click Focus 1. "First adjustment. The lens motor nudges forward. Contrast goes up. The camera knows it's moving in the right direction. Already a bit sharper."

Click Focus 2, 3. "Each time, the adjustment gets smaller. The big corrections happen early — when you're way out of focus, ANY movement toward the right position makes a dramatic improvement in contrast. But as you approach the peak, the contrast curve flattens out. The gains get subtler. The motor makes finer and finer adjustments."

"This is what early contrast-detection AF cameras did — and if you remember the 1990s, you remember the sound of the lens hunting back and forth, especially in low light. That hunting IS the iteration. Modern phase-detection AF is much faster because it can calculate the direction and distance to the focus point directly, rather than hunting. But the underlying principle — search for the optimum — is the same."

Click Focus 4, 5. "Now the adjustments are tiny. We're very close. Fine-tuning."

Click Locked. The bracket turns green.

"Focus locked. The camera has found the sweet spot — the lens position where contrast is maximised. The image is as sharp as it can possibly be."

"Maximum likelihood estimation works in exactly the same way. The 'image' is the measurement — the true position of every person and every item on the scale. It's already in the data, just like the scene is already in front of the lens. The algorithm starts with crude initial estimates, computes what the data SHOULD look like given those estimates, compares predicted to observed, and adjusts in whatever direction improves the fit. Over and over, with each adjustment smaller than the last, until it converges."

"That convergence point is the maximum of the likelihood function. It's the peak of the hill. The point of sharpest clarity. The point where the predicted data matches the observed data as closely as mathematically possible."

"The specific technique the Rasch model uses for these adjustments is called Newton-Raphson. It's more sophisticated than the camera's simple contrast-detection hunt — rather than just checking 'better or worse,' it uses the slope and curvature of the likelihood function to calculate EXACTLY how far to adjust and in which direction. It's like upgrading from the old hunting contrast-detection motor to a modern system that knows precisely where to go. But the principle is identical: iterate toward the optimum."

"Now let me show you what this actually looks like with real numbers."`,

  // Slide — MLE: The Iteration Process
  `This is the full Moulton-style MLE demonstration. Take your time. Each click is one iteration. The audience needs to SEE the numbers settle.

Click Raw Data.

"Here is our response matrix — 9 persons labelled A through I, 10 items. Ones and zeros. On the right you can see the row totals — Person A got 8 correct, Person I got 2. The column totals show how many persons got each item right. Items 1 to 4 were easy. Items 9 and 10 were hard — only 1 correct each."

"The initial ability and difficulty estimates on the right come from the simplest possible transformation: the log of the odds. Take the raw proportion of items a person got correct, divide by the proportion incorrect — that gives you the odds. Then take the natural log. Person A got 8 out of 9, so the proportion is about 0.89, the odds are about 8:1, and the log-odds is about 2.1. Person G got half right — proportion 0.5, odds 1:1, log-odds zero. Person I got 2 out of 10 — proportion 0.2, odds 0.25:1, log-odds negative. Same logic for items but in reverse."

"These initial logits are VERY rough. They're just the raw proportions converted to a log scale. They don't account for which specific items a person got right or which specific persons got an item right. They're the blurry starting image. The whole point of the iterative process is to refine these crude starting estimates into precise measurements."

"Now watch what happens."

Click Iteration 1.

"Each cell now shows two numbers. The top number is the EXPECTED VALUE — the probability this person gets this item right, computed from the Rasch formula using current estimates. The bottom number in colour is the RESIDUAL — observed minus expected."

"Red cells have large residuals — the predictions are still poor. Green cells are near zero — prediction matches reality. On the right, the estimates have shifted — the yellow arrows show movement. The total residual at the bottom has dropped."

Click Iteration 2.

"Second pass. Expected values recalculated with updated estimates. Residuals shrink further. The faded dots show where estimates WERE — you can see the refinement happening."

Click Iteration 3, then Iteration 5.

"Most residuals are green now. The total residual is much smaller. Estimates are barely moving."

Click Iteration 10, then 15.

"The adjustments are now tiny. The estimates have almost settled."

Click Iteration 20.

"Converged. The maximum change in any estimate is below 0.001. Every person ability, every item difficulty, is at the point where predictions match observations as closely as possible. These are your measurements — jointly estimated on the same logit scale."`,

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
  `This slide is critical. Most people you talk to have no idea what reliability really is. You need to dismantle the misconception and replace it with the correct understanding.

Start with the misconception:

"If you ask most people what reliability means, they'll say something like: 'It's about repeatability. If I gave the test again, would I get the same result?' That sounds reasonable. But it's putting the cart before the horse."

Point to the red box. "This view is simplistic and misleading. Let me explain why."

Now transition to the green box:

"Reliability is really about one thing: how precisely can we SEPARATE persons and place them according to their abilities, given the error — the noise — in our measurements?"

"Think about it this way. The items in a test each carry some measurement error. That error reflects how well the items are TARGETED to the people taking the test. If items are well targeted — meaning the difficulty of the items matches the ability range of the people — then each response carries maximum information. The error is small. We can tell people apart with precision."

"But what happens when items are poorly targeted?"

Give the first example: "Suppose you have a test where there's a 99% chance that everyone will get most items right. What does that tell you? Almost nothing. You know they'll all get it right, but you CANNOT infer their true underlying ability. Their true ability could be just barely above the items, or it could be miles above. You can't tell. The error is enormous."

Give the second example: "Now flip it around. Give very young children a medical school entry exam. They have virtually no chance of answering any item correctly. That tells you nothing about the children's ability. It could be anywhere below the items. The error, derived from Fisher information, is so high that any separation of persons is untrustworthy."

Now point to the equation:

"The Person Separation Index makes this transparent. It's the variance of the ability estimates — that's the total spread of persons — minus the mean squared standard errors — that's the average noise — divided by the total spread. It tells you: of all the variation we observe in ability estimates, how much is SIGNAL and how much is NOISE?"

"When items are well targeted, error is small, and the ratio is high — we can separate people reliably. When items are poorly targeted, error dominates, and the ratio collapses — we CANNOT separate people, regardless of how 'repeatable' the scores might be."

Now the key reframe:

"So here's the crucial point. The traditional view says reliability means 'we'd get the same result if we did it again.' The Rasch perspective says reliability means 'we can tell people apart with precision.' Repeatability is a CONSEQUENCE of good separation — not the definition of it. If you have high person separation, yes, the results will be repeatable. But the repeatability is the symptom. The thing itself is: can we differentiate between persons in a clear, trustworthy manner?"

"A test where everyone scores 99% is perfectly 'repeatable.' Give it again, everyone scores 99% again. But it tells you almost nothing about where people actually stand. That is LOW reliability despite HIGH repeatability. That's why the traditional definition puts the cart before the horse."`,

  // Slide — Fit and Construct Validity
  `This slide bridges reliability into validity. Start by reading the subtitle line on screen.

"The Rasch model is a validity machine. It creates a simulation so we can examine whether items operate in unison, reflecting the overall model. That examination is fit — and fit is the quantitative heart of construct validity."

"Since Messick in the 1980s, we've understood that construct validity is the overarching concept — content validity, predictive validity, concurrent validity are all just pieces of evidence for it. In the Rasch model, fit IS that evidence. If items fit the model, they're measuring the same construct. If they don't, something is wrong with the item, or with our understanding of the construct."

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

"Remember what we established in Lecture 1: measurement requires invariance. The comparison between two persons must be independent of which items are used. The comparison between two items must be independent of which persons are tested."

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

"This photograph stopped me in my tracks at the Melbourne Museum. Dung beetles and stag beetles, arranged in spirals by size — each one larger than the last. It's the visual signature of exponential growth."

"Look at the beetles at the small end. Tiny. Now look at the ones at the top. Enormous. The absolute size increments get larger and larger and larger. That's exponential growth — each step is bigger than the last."

"But here's the key: the RELATIVE growth — each increment as a proportion of the current size — is CONSTANT. The beetle doubles, then doubles again, then doubles again. The ratio is the same every time."

"Absolute growth: exponential. Relative growth: linear."

Pause. "This is exactly what the Rasch model is."`,

  // Slide 10 — Three Views of the Same Thing
  `This is the mathematical heart of the lecture. Use the interactive triple-panel display.

"There are three ways to express the relationship between a person's ability and an item's difficulty. They are three views of the SAME thing."

Point to the left panel. "ODDS. The odds of a correct response are exponential. As the difference between ability and difficulty increases, the odds grow without bound. Odds of 1:1, then 3:1, then 7:1, then 20:1, then 55:1... exploding upward. Like the beetle — absolute growth is exponential."

Point to the centre panel. "LOG-ODDS — logits. Take the natural logarithm of the odds, and the exponential curve becomes a straight line. EQUAL intervals. A one-logit increase ALWAYS means the same thing — the odds have been multiplied by e, about 2.72. This is where measurement lives. This is the Rasch scale."

Point to the right panel. "PROBABILITY. Odds divided by one-plus-odds. The exponential growth, meeting a ceiling. Probability can never exceed 1 — you can never be MORE than certain. The result is the sigmoid — the S-curve. This is what we actually observe."

Now use the slider. "Watch what happens as I increase the ability-difficulty difference..."

Drag the slider slowly. "Odds explode upward. Logits move steadily — equal steps. Probability approaches 1 but never reaches it."

"Three views. One reality."`,

  // Slide 11 — Why Logits Are the Scale
  `"Why do we measure in logits rather than odds or probabilities?"

"Because logits are LINEAR. And linearity means equal intervals. A one-logit difference between two persons means the same thing regardless of where they sit on the scale."

"Think of the beetle again. If you tried to measure growth using the beetle's absolute size — the exponential — a unit at the small end would mean something completely different from a unit at the large end. That's not measurement."

"But if you measure using the RELATIVE growth rate — the logarithm — then every unit means the same proportional change. That IS measurement."

"In the Rasch model, a one-logit increase in ability always multiplies the odds of success by the same factor — e, approximately 2.72. Whether you're at the bottom of the scale or the top, one logit means the same thing."

"This is why the log-odds scale is the measurement scale. It linearises the exponential — and linearity is where equal-interval measurement lives."`,

  // Slide — Rasch Meets the Heavy Hitters
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
