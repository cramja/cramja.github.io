---
layout: post
title:  "Measuring Climate Change"
date:   2016-12-29 06:00:00 -0600
categories: research
draft: false
short: Using publicly available data, we can find a warming trend in 50 years of daily mean temperature recordings. I've including some pictures and the source code we used for the analysis. It's pretty simple. The results are irrefutable.
---

# Background

We are living in uncertain times. There are those in global leadership positions who doubt the existence of global warming and whose beliefs will influence energy policy; they could essentially steer the ark of humanity in the same direction which the industrial revolution has had us driving for the last two centuries. As citizens of arguably one of the worst polluting countries on earth (we Americans emit 25% of the annually released CO$$_2$$), it behooves us to take a closer look at our impact, for the consequences could be dire. In the coming years, we may be faced with populations displaced by rising sea levels, drought-induced famine, powerful hurricanes, and a planet which has irreversibly changed. 

The goal of this project is to take a tractable data set and extrapolate the warming trend which is at the root of at least some of the environmental issues humans have wrought on this planet. 

This project was inspired by a [research paper written by a Princeton statistician](https://arxiv.org/pdf/1209.0624.pdf). The thrust of the paper was not to show evidence of global warming but to explain the usage of a specific type of regression method. If you're interested in the regression method, read the *LAD* section, otherwise skip it. The more interesting part of this article is probably the [analysis](#analysis) section.

## LAD: Least Absolute Deviations

<small>*Note: Javascript must be enabled for the math to be rendered correctly*</small>

When we think of fitting a line to a curve, we usually think of the most common regression method, Least Squares. In optimization, least squares is trying to fit a curve to a set of points by minimizing the squared distance of the vertical distance (residual) from the points to the fitting line. We'll stick with a linear optimization problem in which case the problem is simply stated as

<div><span>
$$min_x (x*a_i - y_i)^2$$
</span></div>

Where $$a_i$$ is the coordinates of a variable, and $$y_i$$ is the dependent variable, the thing we want to predict. $$x$$ is a coefficient vector which we are setting to the optimal configuration in order to minimize the squared difference between our estimate of the solution, $$y$$ and the approximation of a solution, $$x*a_i$$. With the weather data, our $$a_i$$ is essentially the day of the year, and $$y_i$$ is the predicted average temperature at that day of the year. This should be simple right? We know in the winter that it is cooler, and in the summer, hotter. Easy.

Going back to the minimization problem, we need to account for outliers. In weather data, there are many unseasonably warm days in the winter, and cool days in the summer. However, we don't want our model to overcompensate for these anomalies. Unfortunately, because LS squares the error, it will do just that! Here's a simple illustration of this fact. 

<a href="/assets/ls-outlier.png"><img src="/assets/ls-outlier.png"/></a>

The blue line ignores the red outlier point. The red line fits with the red outlier. We can get a better fit by using least squares and ignoring the outlier, using regularization, or we can use a different optimization problem.

Least Absolute Deviations is like Least Squares, except it doesn't square the error. The problem is simply

<div><span>
$$min_x \lvert x*a_i - y_i \rvert$$
</span></div>

This problem is actually much more difficult to compute in theory because unlike Least Squares, we cannot take the derivative of the equation which means we cannot use the standard gradient descent technique for minimization. However, using the a solver like [CVX](http://cvxr.com/cvx/), we can easily compute the minimum $$x$$. Now, with our same outlier data, the fit becomes much better even with the outlier.

<a href="/assets/l1-outlier.png"><img src="/assets/l1-outlier.png"/></a>

The green line is the LAD fit with the outlier accounted for in the fitting data. It's practically the same as the LS fit with the outlier removed.

Since climate data is prone to being full of outliers, we use a LAD fit.

# Method

I retrieved 40 years worth of mean daily temperature data from NOAA's ftp site. I used data from Dane County regional airport because I am currently living in Madison, Wisconsin and the airport is the closest weather collection center I could find. I wanted to see how the weather has changed where I live because climate change can be sort of abstract in that it takes time to reveal itself. Understanding the amount of change that my domain has changed in the last 40-50 years is illuminating.

All of the source code for the analysis can be found on [github](https://github.com/cramja/climate-data).

## Model

If you think about weather data, it's cyclic (for areas apart from the equator). As the earth tilts, we get slightly more or less sunlight, this effect being mainly responsible for yearly seasons. We model this cyclic pattern using the equation

<div><span>
$$x_0 + x_1d$$

$$+ x_2cos(\frac{2\pi d}{365.25}) +   x_3sin(\frac{2\pi d}{365.25})$$

$$+ x_4cos(\frac{2\pi d}{10.7 * 365.25}) + x_5 sin(\frac{2\pi d}{10.7 * 365.25})$$
</span></div>

It's the same equation used by Vanderbrei. If the last line looks confusing because of the `10.7` constant, it's because it's accounting for an effect known as the [solar cycle](https://en.wikipedia.org/wiki/Solar_cycle
). 


## Analysis

I'll spare the details of solver, except to say that here is [the data](https://raw.githubusercontent.com/cramja/climate-data/master/clean_data/DaneCo_Airport.csv) that we got from NOAA and cleaned up. Shown below is the last 40 or so years of predicted average temperatures.

<a href="/assets/warming.png"><img src="/assets/warming.png"/></a>

I extrapolated the linear warming component and plotted it in red. The black line is for contrast and it shows what a zero warming trend would look like.

It may be hard to see, but over the last 40 years, there's been a **2.14** F degree increase in average temperature.

If you'd like information about the confidence of this method, the original paper has a good explanation of calculating confidence intervals for this model. The warming trend we find is well within the confidence interval Vanderbrei finds.

To compare this LAD model with the LS model, I zoomed into one of the peaks (corresponding to high summer) as predicted by the LS (black) and LAD (blue).

<a href="/assets/warming-ls.png"><img src="/assets/warming-ls.png"/></a>

Notice that LS has higher peaks as it overcompensates for outliers.

## My take

It's amazing that in such a small data set we can find global warming. It's very close to home.

If 2.14 degrees of warming in the last 40 years doesn't seem like a lot, consider feedback effects. For example, consider a cold drink with ice cubes in it. The temperature of the water will remain around 32 degrees so long as the ice cubes are melting. They absorb the heat and keep the temperature of the water relatively constant. Once all the ice has gone through a phase change, the water temperature begins to rise. The arctic ice caps works like an ice cube in a drink but with our oceans. Unfortunately, they're melting faster than ever before. Once they're gone, who knows what will happen. One thing is for sure: it's getting hotter, much hotter.

Warming is not a linear trend like in the model presented. It's probably exponential due to feedback effects like the sea ice melt. More examples of feedback effects are when methane is released from melting permafrost or rising ocean temperatures releasing dissolved CO$$_2$$. It will be interesting to redo this analysis in another 40 years. We might have to change the model to account for step-function changes like after the ice is gone.

I think one of the problems with global warming is that it's a hard problem to understand with our five senses. As a society which spends very little time interacting with the environment, I think we're just not viscerally aware of the issue, not enough to be fired up and make real changes. I know I can spend days indoors and at the computer, the only outdoors time I get being the walk to work. Being so disconnected makes it easy to ignore the problem and not think about solutions.

That said, I have high hopes for the future. As we enter 2017, solar is cheaper than ever before, more states are relaxing our draconian drug policy, and consumers are buying more and more into local food movements. 

The more we as individuals become aware, the more we will change.
