import { use, spread, mergeProps, insert, createComponent, effect, setAttribute, template } from 'solid-js/web';
import { splitProps, onMount, onCleanup, createEffect, For } from 'solid-js';
import SortableJs from 'sortablejs';

const _tmpl$ = /*#__PURE__*/template(`<div>`);
const SORTABLE_OPTION_FIELDS = ['animation', 'chosenClass', 'dataIdAttr', 'delay', 'delayOnTouchOnly', 'direction', 'disabled', 'dragClass', 'draggable', 'dragoverBubble', 'dropBubble', 'easing', 'fallbackClass', 'fallbackOffset', 'fallbackOnBody', 'fallbackTolerance', 'filter', 'forceFallback', 'ghostClass', 'group', 'handle', 'ignore', 'invertedSwapThreshold', 'invertSwap', 'onAdd', 'onChange', 'onChoose', 'onClone', 'onEnd', 'onFilter', 'onMove', 'onRemove', 'onSelect', 'onSort', 'onStart', 'onUnchoose', 'onUpdate', 'preventOnFilter', 'removeCloneOnHide', 'setData', 'sort', 'swapThreshold'];
// Would love to type-check if all fields are present, but that seems rather challenging - https://stackoverflow.com/questions/58167616/typescript-create-an-exhaustive-tuple-type-from-another-type/58170994#58170994

const OUR_PROPS = ['items', 'setItems', 'idField', 'class', 'style', 'id', 'children'];
const dragging = {
  item: undefined
};
function Sortable(props) {
  let sortableContainerRef;
  let sortable;
  const [options, otherAndOurProps] = splitProps(props, SORTABLE_OPTION_FIELDS);
  const [ourProps, otherProps] = splitProps(otherAndOurProps, OUR_PROPS);
  onMount(() => {
    sortable = SortableJs.create(sortableContainerRef, {
      ...options,
      animation: 150,
      onStart(event) {
        dragging.item = ourProps.items[parseInt(event.item.dataset.index)];
        options.onStart?.(event);
      },
      onAdd(event) {
        const children = [...event.to?.children];
        const newItems = children.map(v => ourProps.items.find(item => item[ourProps.idField].toString() === v.dataset.id) || dragging.item);
        // from: where it came from
        // to:   added to
        children.splice(event.newIndex, 1);
        event.to?.replaceChildren(...children);
        ourProps.setItems(newItems);
        options.onAdd?.(event);
      },
      onRemove(event) {
        // from: where it removed from
        // to: where it added to
        const children = [...event.from?.children];
        const newItems = children.map(v => ourProps.items.find(item => item[ourProps.idField].toString() === v.dataset.id));
        children.splice(event.oldIndex, 0, event.item);
        event.from.replaceChildren(...children);
        ourProps.setItems(newItems);
        options.onRemove?.(event);
      },
      onEnd(event) {
        const children = [...sortableContainerRef?.children];
        const newItems = children.map(v => ourProps.items.find(item => item[ourProps.idField].toString() === v.dataset.id));
        children.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
        sortableContainerRef?.replaceChildren(...children);
        ourProps.setItems(newItems);
        dragging.item = undefined;
        options.onEnd?.(event);
      }
    });
    // console.debug("Sortable created:", sortable)

    onCleanup(() => {
      sortable.destroy();
    });
  });
  createEffect(prev => {
    const clonedProps = {
      ...options
    };
    if (!prev) ; else {
      const diff = Object.entries(clonedProps).filter(([key, newVal]) => newVal != prev[key]);
      //console.debug('props update', diff, { newProps: clonedProps, prev })
      for (const [key, newVal] of diff) {
        if (['onStart', 'onAdd', 'onRemove', 'onEnd'].includes(key)) console.warn(`Reactive callbacks are not supported yet in solid-sortablejs. Changed:`, key);else sortable.option(key, newVal);
      }
    }
    return clonedProps;
  }, null);
  return (() => {
    const _el$ = _tmpl$();
    const _ref$ = sortableContainerRef;
    typeof _ref$ === "function" ? use(_ref$, _el$) : sortableContainerRef = _el$;
    spread(_el$, mergeProps(otherProps, {
      get ["class"]() {
        return "sortablejs" + (ourProps.class ? ` ${ourProps.class}` : '');
      }
    }), false, true);
    insert(_el$, createComponent(For, {
      get each() {
        return ourProps.items;
      },
      children: (item, i) => (() => {
        const _el$2 = _tmpl$();
        insert(_el$2, () => ourProps.children(item));
        effect(_p$ => {
          const _v$ = item[ourProps.idField],
            _v$2 = i();
          _v$ !== _p$._v$ && setAttribute(_el$2, "data-id", _p$._v$ = _v$);
          _v$2 !== _p$._v$2 && setAttribute(_el$2, "data-index", _p$._v$2 = _v$2);
          return _p$;
        }, {
          _v$: undefined,
          _v$2: undefined
        });
        return _el$2;
      })()
    }));
    return _el$;
  })();
}

export { Sortable as default };
//# sourceMappingURL=index.js.map
