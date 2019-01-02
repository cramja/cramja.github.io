---
layout: post
title:  "Hibernate"
date:   2018-12-31 18:00:00 -0600
categories: work
draft: true
short: My thoughts on Hibernate (a programming thing which is called an "object relational mapper").
---

_This will probably not be very interesting to most people. You've been warned._

I've been working with Hiberate as part of the work that I do at Autonomic. Hibernate takes relation database tables and maps their rows into Java objects. It also handles the reverse: it can save a complex graph of objects back into the database, assuming you've done all the annotations correctly. In other words, Hibernate is an Object Relational Mapper, or ORM. 

Anyone who has been involved with ORMs probably has strong opinions one way or another, and as a supreme thought-leader in the areas of technology and computer science, I will bless the world with my rarified thoughts on the matter.

> It's all just stuff.

I heard this from our now CEO when he was talking about Spring after someone expressed some opinions about it (which way? I don't remember, but seeing as that it's my adopted passtime to rag on Spring, it was probably negative). The reason I like the phrase, _it's all just stuff_ is that there's a good deal of practical stoicism in that statement. Spring, Hibernate, This, and That component of your stack are not things to get overly embroiled about when they start throwing weird exceptions, or falling apart in ways that you couldn't have anticipated from looking at the super-cool marketecture diagrams on the product's Bootstrap'ed site. Every tool that you work with will have its short comings, and the more narrowly focused that tool is at solving a problem, the more likely you will be dissappointed when you find out that your problem isn't the problem the tool was meant to solve.

That's been my experience with Hibernate so far: it solves a problem, but that problem isn't necessarily what I needed it to solve. And, even further, sometimes I couldn't anticipate _how_ it was going to solve a problem, which can lead to a lot of grief.

An example of this is persisting an entity with a OneToMany mapping with a related entity. I cautiously made all the OneToMany relationships Lazy so as not to trigger joins but later found out (in production) that persist calls would select all the OneToMany entities, greatly slowing down the application. In that instance, I replaced Hibernate with JDBC calls and predictably brought the performance to acceptable levels. This is an instance where I could not anticipate how Hiberate would try to solve the problem of persisting an object with OneToMany mappings (and still haven't munged around in the code to figure out why it was retrieving all the unnecessary entities).

Another strange contortion I had to make to work with Hibernate was needing to use OneToMany and ManyToOne mappings on objects just so I could get HQL (Hibernate Query Language) to join two entities together. The scenario was that we provide a small filter language in our APIs that allows customers to make Filter statements that resemble the structure of the http representations we return. For example, `attributes has { name = 'xxx' and value = 'yyy'}` would mean we're joining our base table to a table called `attributes`. The thing is, if you didn't want to incur the possible hidden joins which OneToX relationships seem to carry along, then it's not unreasonable that you'd want to leave out the annotations. But, not so fast, because if you want to use joins in HQL, then you'll need those annotations. 

Now, I should give Hibernate credit as in their latest version, it is possible to express joins in HQL without explicit annotations. In general the authors of the library have built in ways to extend the framework. We use custom operators to handle postgres's  JSONB type and a few of the interesting JSONB operators that aren't standard SQL. The thing is, I spent maybe 20 minutes reading postgres's documentation on JSONB and trying it my sandbox database. It took several hours to figure out how to extend Hibernate and then extend the Filter language we provide as part of our product. While I think that it was interesting that Hibernate allows extendability, I had to learn a big chunk of hibernate before I could be effective with it.

These last two examples, the JSONB example and the HQL/joins example I've concluded are evidence that Hibernate was not the ideal fit for the kinds of non-standard and performance-concerned applications we build. On the other hand, I've been reading code from an open-source project that uses Hibernate, Keycloak, and found that they wrote their app with the restrictions of Hibernate in mind. For example, instead of using a native UUID type for some of their table's primary keys, they used varchar types because every database which hibernate supports would support a varchar. They sacroficed a little be of performance for a lot of generality. Actually, a much better example of how they wrote their application in accordance with Hibernate is how they use many, simple entities mapping almost directly to the Representations returned in their REST APIs. They don't have fancy search abilities in their app, in favor of simple keyword searches. (in fact, some of their searches are done entirely in javascript, after loading the entire set of database entities to the browser). My conclusion is that if you're app does a few non-standard-hibernate things, then you're probably better off with JDBC or a light-weight non-ORM mapper.
