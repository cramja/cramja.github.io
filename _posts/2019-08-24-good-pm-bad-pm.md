---
layout: post
title:  "Margin Notes: Good PM / Bad PM"
date:   2019-08-24 01:00:00 -0800
categories: work
draft: false
short: Margin notes for the most resonant part of "Hard Thing About Hard Things".
---

Reading _Hard Thing About Hard Things_ by Ben Horowitz and this short essay _Good PM / Bad PM_ resonated as it touches on topics relevant to far more positions besides only product manager. Since I like the content so much, I'll go ahead and reproduce it here with my margin notes.

Here's the essay, as copy pasted from [Andreessen Horowitz's website][source] with my stream of consciousness responses.

> Good product managers know the market, the product, the product line and the competition extremely well and operate from a strong basis of knowledge and confidence. A good product manager is the CEO of the product. A good product manager takes full responsibility and measures themselves in terms of the success of the product. The are responsible for right product/right time and all that entails. A good product manager knows the context going in (the company, our revenue funding, competition, etc.), and they take responsibility for devising and executing a winning plan (no excuses).

To summarize, a PM takes ownership of the success of the product. Nobody has total control on the outcome of a project, but what Horowitz is suggesting is that the proper way to act is that you do have control. You are responsible for execution. Note that he doesn't go as far as to say you are completely responsible for the outcome. My experience would suggest that feeling total responsibility for the outcome would be taking it too far given the presence of randomness and circumstance. Execution, however, is squarely in your court. Foundational to execution is research as it informs the potential directions you may execute. You must do the requisite work. Execution is then an outcome and a discipline.

> Bad product managers have lots of excuses. Not enough funding, the engineering manager is an idiot, Microsoft has 10 times as many engineers working on it, I’m overworked, I don’t get enough direction. Barksdale doesn’t make these kinds of excuses and neither should the CEO of a product.

This is universally applicable. If you spend your time making excuses instead of executing, you're not acting in accordance with the principle that you have control over the outcome. I don't know who Barksdale is, but sub in the name of someone in leadership for whom you have respect, and probably they do not spend their time making excuses. Bitching doesn't earn respect. Execution earns respect.

> Good product managers don’t get all of their time sucked up by the various organizations that must work together to deliver right product right time. They don’t take all the product team minutes, they don’t project manage the various functions, they are not gophers for engineering. They are not part of the product team; they manage the product team. Engineering teams don’t consider Good Product Managers a “marketing resource.” Good product managers are the marketing counterpart of the engineering manager. Good product managers crisply define the target, the “what” (as opposed to the how) and manage the delivery of the “what.” Bad product managers feel best about themselves when they figure out “how”. Good product managers communicate crisply to engineering in writing as well as verbally. Good product managers don’t give direction informally. Good product managers gather information informally.

Here, we learn the proper relationship between product and engineering. Essentially, a PM's function is defining the target and the reasons for selecting the target (why). Engineering implements and gives feedback.

From my engineering perspective, I need to know what the needs and wants of the customer. Additionally, I need to understand _why_ a particular feature is valuable. Especially on a highly technical product, there's plenty of room for engineering to make product decisions. A good example of this is when building an account management application, I need to make decisions about a user's relation to an account. Can users be a member of a single Account, or can they be members of many? What's the expected interaction model? What levels of access will customers need? Does an admin user need top-down control over all the members of the account down to the level of being capable of disabling users? Or is it a loose model like the Organization concept of GitHub- at worst, I can be evicted from an Organization but my login continues to work? From an implementation perspective, one approach isn't necessarily more complex than another, but from a product success standpoint, there's probably a right fit which a good PM has insight.

In summary, a PM's role as maintaining the vision for where the product is heading, describing the general philosophy of the product, allowing engineers to make decisions with a guiding set of principles.

> Good product managers create leveragable collateral, FAQs, presentations, white papers. Bad product managers complain that they spend all day answering questions for the sales force and are swamped. Good product managers anticipate the serious product flaws and build real solutions. Bad product managers put out fires all day. Good product managers take written positions on important issues (competitive silver bullets, tough architectural choices, tough product decisions, markets to attack or yield). Bad product managers voice their opinion verbally and lament that the “powers that be” won’t let it happen. Once bad product managers fail, they point out that they predicted they would fail.

This section re-iterates the ownership concept. Since the proper way to act is such that you have control on the outcome, you should have skin in the game: write down your decisions. Not only that, but your writing is part of the product. It serves as marketing, it serves as the written explanation of that product philosophy you have been developing in conjunction with customers and engineering.

Additionally, there's a point about busy-ness (putting out fires). Someone who is constantly _busy_ is probably not focused on the important things. I recall Eisenhower's advice, _I have two kinds of problems, the urgent and the important. The urgent are not important, and the important are never urgent._

> Good product managers focus the team on revenue and customers. Bad product managers focus team on how many features Microsoft is building. Good product managers define good products that can be executed with a strong effort. Bad product managers define good products that can’t be executed or let engineering build whatever they want (i.e. solve the hardest problem).
Good product managers think in terms of delivering superior value to the market place during inbound planning and achieving market share and revenue goals during outbound. Bad product managers get very confused about the differences amongst delivering value, matching competitive features, pricing, and ubiquity. Good product managers decompose problems. Bad product managers combine all problems into one.

The role of a PM is to define and guide the product.

I especially like the point about _letting engineering build whatever they want_. We will build the most complex thing. It's fun. What's important for the product is that someone is taking this in, understanding it, and constantly pushing for simplicity. Why do projects become overly complex? No one told the engineers to make it simple.

I have seen T-Shirt sizing done as a kind of ritual. A good PM understands the point of sizing is to understand the cost and complexity of an engineering decision. It is information that could be used to steer the product in such a way the reduces complexity.

The final point of this section is problem decomposition. Valuable for just about any complex role, the point is to be able to analyze a problem from various angles without being overwhelmed by the composite complexity.

> Good product managers think about the story they want written by the press. Bad product managers think about covering every feature and being really technically accurate with the press. Good product managers ask the press questions. Bad product managers answer any press question. Good product managers assume press and analyst people are really smart. Bad product managers assume that press and analysts are dumb because they don’t understand the difference between “push” and “simulated push.”
Good product managers err on the side of clarity vs. explaining the obvious. Bad product managers never explain the obvious. Good product managers define their job and their success. Bad product managers constantly want to be told what to do.

I love this section. There's two important points.

One is that good PM's have aspirations and visions for the product which they  communicate outside the organization. They understand that the implementation of that vision will not be obvious to an external audience at first- this is why the product isn't commodity.

Second, there's a component of offense versus defense. A good PM is on the offense: they anticipate what they want to have their audience absorb as the general take-away. A bad PM is playing defense: rattle off every feature like they are justifications, and answer every question out of fear or lack of confidence.

> Good product managers send their status reports in on time every week, because they are disciplined. Bad product managers forget to send in their status reports on time, because they don’t value discipline.

I've never had to hand in a status report, but I agree, discipline is important. Especially in tech which has an air of slovenliness: dress code is hoodies, showing up late in the morning is the norm, and being pampered with free lunch and snacks is baseline. Be serious where it matters. If you're an engineer, consistently refactor, simplify. Be aggressive responding and learning from alerts. Get up early to read and self-learn. These habits cannot be stocked in the company fridge.

So, that concludes my margin notes. I'd like to add one component which feels in line with all that has been said so far. From Taleb, _the point is not to win arguments, the point is to win_. In tech, I've various practices and patterns appear. In engineering, patterns manifest as frameworks like Spring or agile practices like scrum. In product, we participate in practices like t-shirt sizing, and product requirement specification templated docs, etc. These are the outcome of applying a pattern and they're not inherently bad but at the same time their use or application does not equal success. One should go beyond the learning the patterns and practices and focus on why the practices exist in the first place.

[source]: https://a16z.com/2012/06/15/good-product-managerbad-product-manager/
