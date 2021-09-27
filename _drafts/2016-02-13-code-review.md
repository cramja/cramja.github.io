---
layout: post
title:  "When Coding Feels Like Treading Water"
date:   2016-02-13 06:37:16 -0600
categories: tech
short: This morning when I sat down to write, I started thinking about code. Darn coffee, you got me into this.
---

This morning when I sat down to write, I started thinking about code. Darn coffee, you got me into this.

## Context
I've been writing an indexing structure for [Quickstep](https://github.com/pivotalsoftware/quickstep), an open source in-memory database. Quickstep is in a stage of development where it's more than an experimental project, but not a full-fledged DBMS. 

The index structure I wrote is simple. It keeps track of the relation's minimum and maximum values for each column. This allows queries to quickly be skipped if they fall outside the range of the table. This index, which we call 'SMA' for small materialized aggregates, is a simplification of the index described in this [paper](http://www.vldb.org/conf/1998/p476.pdf). A full-featured SMA will be able to index over arbitrary groupings like the following example:

{% highlight sql %}
CREATE SMA ON someTable
SELECT someAttribute as x, MIN(x), MAX(x), COUNT(x)
WHERE 1 
GROUP BY someOtherAttribute;
{% endhighlight %}

Our index is simpler, keeping only min and max and not allowing for GROUP BYs.

{% highlight sql %}
CREATE SMA ON someTable
SELECT someAttribute as x, MIN(x), MAX(x), COUNT(x), SUM(x);
{% endhighlight %}

It's taken me more than a month to write into the code into Quickstep, and yesterday I presented the code at a code review with some of the ever-patient members of the Quickstep group.

Sometimes I ask myself, "What are 3 things I would have told my former self if I could go back in time?" I'm approaching that question now, for the sake of my current self.

## Lessons Learned

### Learn the language, stupid

When I started this project, I was uncomfortable with C++. One of the reasons I gravitated to doing this project was that I thought it would be easy and an opportunity to learn C++. I think I spent a lot of time spinning my wheels in the mud because I didn't take a minute to step back and learn the relevant features of C++. 

For example, when I started I was confused about iterators. I did not understand that they were a class inside of a container class and that they used clever overloading of `*`, and that `begin` and `end` actually returned iterator objects. I was sort of blindly copying other code I'd seen and getting by. It wasn't in not taking a half hour to write a simple vector and learn how to implement my own vector before I truly understood what what going on.

There are many features of C++ which I still don't understand (the `&&` used in function arguments, lamdba captures, and more!) and if I were to learn them, here's what I'd do. Go into a temp folder, make a simple C++ program isolating exactly the feature I'm trying to understand, and play with it until I understand the benefits, usage, etc.

### Prepare for a code review

It's not like I didn't. Most of the code was commented. I had an agenda for the meeting. I felt confident going in.

The trouble was the conference room did not have an HDMI adapter so my laptop was useless. Thankfully another team member loaned me theres. 

More importantly, when we could look at the code, it was only then that I realized the deficiencies which I had previously brushed off as minor things.

* Some comments were based on code which had been refactored and so didn't make sense.

* It's hard to explain code without jumping around spuratically in the file.

* The unit tests were well-commented and almost did not need explanation. 

Next time, I would be sure to have an adapter for my laptop. Also, to write down better comments.

### Wrap Up lesson: See the forest from the trees.

One of the problems with getting stuck on language issues was that I did not consider the big picture meaning of writing an index in Quickstep. I did not ask myself the important systems questions:

1. What's the least amount of code impact I can make with the most amount of benefit?

2. Is there a better way to write these features into the system besides the obvious?

I can poke at them now.

1. To answer this question, I have to think about what the most effective aggregates are. Min and Max can skip scans of the entire block, plus they don't take much overhead to store. Simply storing the tuple_id of the min and max attributes is smarter than storing the value because storing the value has the side effect of needing to handle cases of variable-length data. Further, if variable length data is a problem, first writing the index to only handle numeric in-line data might be the best solution.

2. I approached this feature as an extension to the pre-existing index framework. However, this framework was designed with fully-fledged b-trees in mind and therefore might be too heavy weight for what this really is. Perhaps considering storing this information in the catalog would have been a better option.

Overall, I developed these questions only after the code review because of the discussion. Some of the best comments which were discussed didn't have to do with code or style, but rather the high level usefulness of the index. We chatted about cost in terms of painfulness to program versus the performance improvement obtained from that feature. That is, to look at the requested feature and consider the most easily obtained benefits. 

This manner of seeing the forest for the trees was something I needed the team for- they pulled my thoughts out of the quicksand of code.

## Where to go

**Think about design independent of learning the language.**

**Chunk features of the language into manageable pieces.**

**Talk about the code to keep ideas fresh.**

I learned the importance of reflecting on use cases and cost-benefits of writing in certain functionality. In essence, I had ignored this piece when writing the code because I was so lost in the large code base of Quickstep and in a new language. Drowning in the deep end as it were.

I have a little better ability now to doggy paddle my way out of this.


{% comment %}
Now, to explain the next part, I need to give some background on how data in Quickstep is physically stored because it is different from traditional file-based indices. A traditional database stores an entire relation in a large file, so that all N tuples of a relation will be physically grouped together. This model can be parallelized, but it is not intuitive to the programmer. Quickstep divides those N tuples into T blocks with roughly N/T tuples per block. Therefore we can think of Quickstep as arbitrarily grouping tuples on a physical level into blocks instead of grouping tuples on a logical level like in the first SMA example.
{% endcomment %}
