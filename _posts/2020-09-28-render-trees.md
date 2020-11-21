---
layout: post
title: "Render Deep Trees in React"
date:   2020-09-28 01:00:00 -0800
categories: tech
draft: false
short: "There's a trick to rendering deep trees in React: memo."
---


I was working on a tree editor in a react project and a performance issue forced me to dig a little deeper into how React decides to re-render components. I'll quickly share my experience. 

If this is too much, TL/DR Use `React.memo` when you need fine grained control over re-renders. Also check out [the demo](https://react-tree-memo-demo.stackblitz.io/) or the related [source](https://stackblitz.com/edit/react-tree-memo-demo?file=src/App.js).

## Naive Component


A little background on the problem. The first implementation passed the tree data into a `Head` component which then rendered each node recursively as a `Node` component. Note that this version is simplified so it might seem overkill that I used `React.useReducer`, but it greatly simplified things in the non-toy version of this tree.

```jsx
function Head({tree}) {
  const [state, dispatch] = React.useReducer(tree, reduce);

  const handleOnChange = (id, text) => dispatch({type: 'CHANGE', id, text});

  return (
    <Node key={'root'} onChange={handleOnChange} {...tree} />
  )
}
```

```jsx
function Node({id, text, children, onChange}) {
  return (
    <>
      <input value={text} onChange={e => onChange(id, e.target.value)} />
      <div>
        {node.children.map(child => (
            <Node 
              key={child.id} 
              onChange={onChange} 
              {...child} 
            />)
        )}
      </div>
    </>
  )
}
```

Any updates to the state object caused the entire tree to re-render. This has to do with the fact that the `Head` component holds the state which is registered with React. If the state changes, then React cascades the re-render to each child. In theory, this should be unnecessary since each keystroke will only change a single node so only a single node should be re-rendered. But, in the naive version, React re-renders every node which is a huge performance problem with larger trees: rendering hundreds of components on each keystroke made the app unusable.

## Memo'd Component

The fix I settled on was to assign each node a generation and tell React to re-render a component if the generation changed. A generation is simply an integer which increments any time the node changes or any of its child nodes changes. Assigning the current time or even a random string would have achieved the same thing: I just needed to tell react the node's properties were different. 

With the changes in place, separate branches in the tree updated independently, cutting down the number of re-renders to the depth of the update.

In code, all I had to do was update the `Node` component to accept the generation, and create a memoized version of the component which contained the re-render decision-making logic.

```js
function Node({id, generation, text, children, onChange}) {
  ...
}

const MemoNode = React.memo(Node, (prev, next) => prev.generation === next.generation);
```

And then of course, using `MemoNode` in place of Node.

## Demo

Okay, that's it. You can check out this tree structure in action in [a little demo](https://react-tree-memo-demo.stackblitz.io/) I put together. 

Enjoy.
