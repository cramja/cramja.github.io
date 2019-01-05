---
layout: post
title:  "Hibernate"
date:   2019-01-04 12:00:00 -0800
categories: work
draft: false
short: My thoughts on Hibernate (the popular Java "object relational mapper" implementation).
---

I've been working with Hiberate as part of the work that I do at Autonomic. Hibernate takes relation database tables and maps their rows into Java objects. It also handles the reverse: it can save a complex graph of objects back into the relation tables, assuming you've done all the annotations correctly. In other words, Hibernate is an Object Relational Mapper, or ORM. It tries to seamlessly map the domain of relational databases to the Java object model.

Anyone who has been involved with ORMs probably has strong opinions one way or another, and as a supreme thought-leader in the areas of technology and computer science, I will bless the world with my ratified musing. Well, first, someone else's quote.

> It's all just stuff.

I heard this from our now-CEO, Gavin Sherry, when he was talking about Spring after someone expressed some critical opinions about it. The _stuff_ response took me a while to appreciate. The reason I learned to like the phrase, is that there's a good deal of practical stoicism in that statement. Spring, Hibernate, This, and That component of your stack are not things to get overly embroiled over. Have you ever adopted project or library has not started throwing weird exceptions, or falling apart in ways that you couldn't have anticipated? The initial buy-in for using a tool might come from looking at the super-cool marketecture diagrams on the product's Bootstrap'ed site and doing their 20 minute demo, but at some point, if you're not writing toy applications, you'll run up against the rough edges. Or you'll make configuration errors which are unnoticeable at small scales but binge on resources over time. Or you'll need to extend the tool to support a super special feature of your product. The point is, every tool that you work with will have its short comings. Furthermore, you're much more likely to appreciate those short comings when you are waist deep rather than in the 20 minute demo-flirting period. The notion of it just being _stuff_ is the acceptance of this reality.

So, back to Hibernate. It is a library, it is just stuff. I inherited a Hibernate project and have generally been accommodating to its usage. Besides blogs and stackoverflow answers, I even read a book on the subject so that I could be more certain I was doing it the "right way"(TM). After running up against many un-intuitive "features" of the library, I've started to come to the conclusion that Hibernate, and JPA in general, want developers to build apps a very particular way. I'll first cover a few of my Hibernate war stories and then philosophize about what the development process might look like if you were writing a Hibernate-driven application.

## War stories

For the following stories, I will refer to two entities, User and Tag which are in a OneToMany relationship. Below is a toy example of a bi-directional mapping to illustrate the point: user maps to tags, tags maps to users.

```java
@Entity
class User {
    @OneToMany Set<Tag> tags;
}

@Entity 
class Tag {
    @ManyToOne User user;

    @Column String key;

    @Column String value;
}
```

An example of this is persisting an entity with a OneToMany mapping with a related entity. I cautiously made all the OneToMany relationships Lazy so as not to trigger Joins. When you map one entity to another, implying a foreign key or join table relationship between two entities, Hibernate will automatically try to populate the mapping, resulting in a join. This behavior is known as "eager fetching", and can trip up many Hibernate new-comers because the joins it produces will kill application performance as table sizes increase. You can avoid the automatic joins by using 'lazy fetches' which result in joins only after a mapped entity collection is accessed in some way (e.g. `user.getTagSet().size()`). For that reason, the book I was reading actually recommended not using mappings unless you really were positive that your app would benefit from them. My app benefited from them, so I used a bi-directional mapping but later found out (in production) that persist calls would select all the OneToMany entities, greatly slowing down the application. In that instance, I replaced Hibernate with JDBC calls and predictably brought the performance to acceptable levels. This is an instance where I could not anticipate how Hiberate would try to solve the problem of persisting an object with OneToMany mappings (and still haven't munged around in the code to figure out why it was retrieving all the unnecessary entities).

Another strange contortion I had to make to work with Hibernate was needing to use OneToMany and ManyToOne mappings on objects just so I could get HQL (Hibernate Query Language) to join two entities together. The scenario was that we provide a small filter language in our APIs that allows customers to make Filter statements that resemble the structure of the http representations we return. For example, if filtering over Users, an acceptable statement would look like `tags has { key = 'xxx' and value = 'yyy'}` would mean we're joining our base table to a table called `tags`. The thing is, if you didn't want to incur the possible hidden joins which OneToX relationships seem to carry along, then it's not unreasonable that you'd want to leave out the annotations. But, not so fast, because if you want to use joins in HQL, then you'll need those annotations. 

Now, I should give Hibernate credit as in their latest version, it is possible to express joins in HQL without explicit annotations. In general the authors of the library have built in ways to extend the framework. We use custom operators to handle postgres's  JSONB type and a few of the interesting JSONB operators that aren't standard SQL. The thing is, I spent maybe 20 minutes reading postgres's documentation on JSONB and learning how to use it in my sandbox database. It took several hours to figure out how to extend Hibernate and then extend the Filter language we provide as part of our product. While I think that it was interesting that Hibernate allows extendability, I had to learn a big chunk of hibernate before I could be effective with a feature of my database which I could have wrangled more naturally using postgresql.

These last two examples, the JSONB example and the HQL/joins example I've concluded are evidence that Hibernate was not the ideal fit for the kinds of non-standard and performance-concerned applications we build. On the other hand, I've been reading code from an open-source project that uses Hibernate, Keycloak, and found that they wrote their app with the restrictions of Hibernate in mind, forgoing the unique features of the underlying database in favor of basic features used in basic ways.

## Hibernate-driven-development?

I'll admit, I have read exactly one non-Autonomic Hibernate-based application's code, and that is [Keycloak](https://www.keycloak.org/). I'll try to give a few examples of why I think Keycloak is written in a way that considers Hibernate first, prior to considering the relational schema.

The first thing about Keycloak that I noticed was that it relies solely on Hibernate to define the schema (validate the current schema and generate DDLs if the schema does not match the entity model). To me, this seemed like a risky move to let the ORM define your schema, instead of just running on top of it. In contrast, we use Flyway to manage our schema migrations, taking full advantage of postgres-specific SQL. I don't understand Hibernate well enough to the point where I'd let it make decisions about my schema for me.

Since Keycloak allows Hibernate to control their schema, their entity model matches  their relational tables. Additionally, their REST representations closely match their entities. All in all, their app's data models are consistent from data layer to API layer. This kind of similarity of structure means that there's not a lot of explicit wrangling of data-structures when moving from layer to layer in the application which is good: less munging means less opportunities for errors. Given that these 3 layers closely match each other in structure, and that Hibernate controls the data-layer, I will bet that the development process hinged heavily on what the structure of the entities looked like and as a side-effect, of the tables. 

This close-adherence to the whims of Hibernate gives you portability across many different relational database, but you sacrifice performance. Instead of using a native UUID type for some of their table's primary keys, they used VARCHAR types because every database which hibernate supports would support a VARCHAR.  Additionally, the searching capabilities of Keycloak are somewhat lacking. They don't have database-driven search abilities in their app, instead favoring of simple keyword matches. Well, that's not entirely true. Some of their searches are done entirely in javascript, after loading the entire set of database entities to the browser. It seems a little unnatural, especially if you're dealing with large volumes. Though, Keycloak makes good use of caching to get around some of this. 


## Conclusions

As a reminder, my opinions carry the weight of someone who has worked with Hibernate for a year and a half. Here's my tentative conclusions.

The more narrowly focused that tool is at solving a problem, the more likely you will be disappointed when you find out that your problem isn't the problem the tool was meant to solve. In the case of Hibernate, if you're willing to use a relational database in the way which matches Hibernate's expectations, then you'll probably benefit from the boiler plate which Hibernate intends to remove. On the other hand, if you're writing an app that uses custom database features or a flexible schema, then probably using JDBC or a lightweight ORM would be a better match.

Fortunately Hibernate is a small-enough piece of stuff for me to feel like I can form an opinion about after a year and a half. I cannot say the same for the Spring framework, as on one hand I think that it is a scheme by Amazon to create unnecessarily resource-consumptive apps that fill up their cloud as companies make their transition to neomania fueled microservices on public clouds while on the other hand it is really damn convenient when you've learned the relevant parts.