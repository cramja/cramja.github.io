# cramja.github.io

[spehl.net](https://www.spehl.net) or [cramja.com](https://www.cramja.com).

## A Jekyll-based Blog

```
gem update jekyll
bundle update
bundle exec jekyll serve --incremental
```

```
docker run --rm \
  -v "$PWD:/srv/jekyll" \
  -p 4000:4000 \
  jekyll/jekyll:latest \
  jekyll serve --host 0.0.0.0
```